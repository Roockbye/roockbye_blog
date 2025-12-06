--- 
title: PlatypwnCTF2025 crypto/Cognitive Reminder Call
subtitle: "Challenge Crypto" 
date: 2025-12-03T11:11:00Z 
tags: ["crypto, "platypwn2025", "CRC32", "MAC", "medium"] 
---

The server seems to be forgetful :( 
Can you help it remember?

Files provided :
- server.py
- Pipfile.lock 
- Pipfile
- Dockerfile

We’re given a network service. When we connect, we see something like:

```text
Here is the flag: <big hex>
Note: This message was sent over an authenticated channel. Its tag is <tag1> with nonce <nonce1>.
I have forgotten my key :(
But here are 4 congnitive reminders of my key:
Note: This message was sent over an authenticated channel. Its tag is <tag2> with nonce <nonce2>.
[crc0, crc1, crc2, crc3]
Note: This message was sent over an authenticated channel. Its tag is <tag3> with nonce <nonce3>.
Please remind me of my key:
Part 1 (hex):
```

## 1. What the server actually does

Internally, the server:

1. Generates 4 random 16-byte chunks:

 ```python
  enc_key_parts = [os.urandom(16) for _ in range(4)]
  ```

2. Derives an AES key from them:

 ```python
   key = SHA256(enc_key_parts[0] + enc_key_parts[1] +
	            enc_key_parts[2] + enc_key_parts[3])
```

3. Encrypts the flag with AES-256-CBC and sends:

```text
 Here is the flag: <IV || ciphertext in hex>
```

3. Uses a secret `mac_key` and “authenticates” several messages using:

```python
def mac(key, message):
	return crc32(key + message)   # 32-bit CRC
```

So each “Note: … tag is … with nonce …” is basically:

```python
  tag = crc32(mac_key + nonce + message)
```

4. Then it “forgets” the real `enc_key_parts`, but gives us these **4 CRC32 values**:

  ```python
   enc_key_parts_checksums = [crc32(part) for part in enc_key_parts]
 ```

and asks us:
- 4 parts, each 16 bytes, in hex
- a nonce (4 bytes in hex)
- a tag = `crc32(mac_key + nonce + part1 + part2 + part3 + part4)`

5. If our tag is valid **and** all 4 parts have the correct CRC32, it accepts our “reminder”, recomputes the AES key from **our** parts, and sends:

    ```text
    Thanks for reminding me! Here is a reward: <IV || ciphertext’ hex>
    ```

This new ciphertext is the _same plaintext flag_, but encrypted with the key derived from **our** 4 parts.

If we can:
- forge a valid MAC, and
- craft 4 parts that match the required CRC32s,

we can decrypt this second ciphertext and get the flag.

## 2. Big picture of the attack

We want to:

1. **Break the MAC**: `crc32(mac_key || message)`  
→ forge a valid tag for `nonce || part1 || part2 || part3 || part4` without knowing `mac_key`.

2. **Forge the 4 key parts**:  
For each target CRC `ci` in the list `[c0, c1, c2, c3]` we must build a 16-byte block `part_i` such that:

```python
 crc32(part_i) == ci
```

3. **Get the final ciphertext**, decrypt with **our** AES key and recover the flag.

Both come from the same fact: **CRC32 is linear and totally not a secure MAC**.

## 3. Understanding CRC32 as a linear function

In Python, `binascii.crc32(data, seed)` behaves like this:

```python
crc32(data, seed) = A_data * seed  XOR  c_data
```

Where:
- `seed` and the result are 32-bit integers
- operations are over GF(2) (bitwise linear algebra)
- `A_data` is a 32×32 binary matrix
- `c_data` is a 32-bit constant

We don’t need to derive them by hand; we can _ask_ the function by probing different seeds.

### 3.1. Recovering the internal MAC state `crc32(mac_key)`

The MAC is:
```python
tag = crc32(mac_key + data)
```

This is equivalent to:
```python
Ck = crc32(mac_key)
tag = crc32(data, seed=Ck)
```

And because `crc32(data, seed) = A * seed XOR c`, for a given `data` we have:
```text
tag = A_data * Ck XOR c_data
```

That’s a linear equation in 32 bits. If we know:
- `data` (nonce || message)
- `tag` (given by the server)

we can solve for `Ck = crc32(mac_key)`.

How do we get `A_data` and `c_data`?
- `c_data = crc32(data, 0)`
- For each bit `i` of the seed:
```python
 s0 = 1 << i
 sf = crc32(data, s0)
 column_i = sf ^ c_data   # how this seed bit influences the output
 ```

Stacking all columns gives us the 32×32 matrix `A_data`.  
Then we invert it with Gaussian elimination over GF(2) (a 32×32 bit matrix is small) to recover:
```python
Ck = A_data^{-1} * (tag ^ c_data)
```

Once we have `Ck = crc32(mac_key)`, we can compute a valid MAC for **any** data `M`:
```python
fake_tag = crc32(M, seed=Ck)
```

Exactly like the server would.

So:
- We use one of the authenticated messages from the server (e.g. the third one with the checksum list).
- We compute `Ck`.
- Then we can forge a tag for our own `(nonce || part1 || part2 || part3 || part4)`.

## 4. Building 16-byte blocks with a chosen CRC32

Now about the “cognitive reminders”:

The server gives us:
```python
enc_key_parts_checksums = [c0, c1, c2, c3]
```

We must produce 4 blocks `part_i` such that:
```python
len(part_i) == 16
crc32(part_i) == c_i
```

Again, CRC32 is linear, so we can treat this like solving a linear equation.
### Idea

1. Choose a random 12-byte prefix:

```python
 prefix = os.urandom(12)
 ```

2. Let the last 4 bytes be an unknown 32-bit integer `x` (little-endian).  
So the block is `prefix || x`.

3. Define:
    ```python
    F(x) = crc32(prefix + x.to_bytes(4, 'little'))
    ```

Because CRC32 is linear, `F(x)` is an affine function:
```text
  F(x) = B * x  XOR  d
 ```

4. Compute:
- `F0 = F(0)` → that’s `d`.
- For each bit i of x:
	- Let `x = (1 << i)`
	- Compute `Fi = F(1 << i)`
	- The difference `Fi ^ F0` gives you how bit i affects the CRC → column i of matrix `B`.

4. Now, to solve for a target CRC `target`:
    ```text
    F(x) = target
    → B * x XOR F0 = target
    → B * x = target XOR F0
    → x = B^{-1} * (target XOR F0)
    ```
5. Then:
```python
suffix = x.to_bytes(4, 'little')
block  = prefix + suffix
```
And by construction:
```python
 crc32(block) == target
 ```

Repeat this 4 times, once for each target CRC in the list → we get 4 valid 16-byte parts.

## 5. Putting it all together: the exploit flow

Here’s the full logic step-by-step.
### 5.1. Connect and read data

We connect with:
```bash
nc 10.80.8.34 1337
```

We read:
- The initial encrypted flag + its tag and nonce
- The “forgotten key” message + tag/nonce
- The checksum list `[c0, c1, c2, c3]` + tag/nonce

We especially keep:
- `msg3` = the line containing `[c0, c1, c2, c3]` as plain text
- `nonce3`, `tag3` = from the note after that
### 5.2. Recover `crc32(mac_key)`

We treat:
```python
data3 = nonce3 + msg3.encode()
tag3  = int(tag3_hex, 16)
```

We call our helper:
```python
Ck = recover_crc32_key_state(data3, tag3)
```

And now `Ck` is the internal CRC state after the MAC key.  
We don’t know `mac_key` itself, but we don’t care; we can MAC like the server does.

### 5.3. Build 4 valid key parts

For each `ci` in the given list:
```python
part_i = build_block_for_crc(ci)
```

Where `build_block_for_crc` implements the “prefix + 4-byte suffix + linear solve” trick.

We end up with a list:
```python
parts = [part0, part1, part2, part3]  # each 16 bytes
```

And we can verify locally:
```python
for p, c in zip(parts, checksums):
    assert crc32(p) == c
```

### 5.4. Choose our nonce and forge a MAC

We choose a random 4-byte nonce that we haven’t seen before:
```python
new_nonce = os.urandom(4)
```

Build our message:
```python
message = new_nonce + b"".join(parts)
```

Compute the forged tag:
```python
fake_tag = crc32(message, seed=Ck)
```

We keep it as 4 bytes (big-endian or little-endian depending on the server; in our case, big-endian hex).

### 5.5. Talk to the server

The server asks:
```text
Please remind me of my key:
Part 1 (hex):
```

We send:
```text
a96cab226baf6aec2aab327c9d96b8ce
877434fb953113c148214dd625b83ab7
5c469566e4e8b6faf05a68aca7c006ca
f5786f66a44238d235621b94fd42df12
```

(Those were our specific valid parts for that instance.)

Then:
```text
This is an authenticated channel!
Please provide your nonce (hex):
```

We send:
```text
47483567
```

Then:
```text
Please provide the tag of the concatenation of the nonce and the 4 parts (hex):
```

We send:
```text
c569a991
```

This tag is exactly:
```python
crc32(new_nonce + part1 + part2 + part3 + part4, seed=Ck)
```

So the server accepts it.

### 5.6. Get the reward and decrypt

The server answers:
```text
Thanks for reminding me! Here is a reward: <reward_cipher_hex>
```

We copy `<reward_cipher_hex>` and decrypt locally.

To decrypt:
1. Convert hex to bytes.
2. Split:
    ```python
    iv = data[:16]
    ct = data[16:]
    ```
3. Re-derive the AES key exactly as the server does:
    ```python
    hasher = Hash(SHA256())
    for p in parts:
        hasher.update(p)
    key = hasher.finalize()
    ```
4. Decrypt AES-CBC and unpad:
    ```python
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded = decryptor.update(ct) + decryptor.finalize()
    
    unpadder = PKCS7(128).unpadder()
    plaintext = unpadder.update(padded) + unpadder.finalize()
    ```

The result is the flag:
```text
PP{h4sh3s_4r3_m0r3_th4n_ch3cksums::9--CHRRGexlY}
```

## Why this is insecure ?

 CRC32 is not a cryptographic function. It’s _linear_ and has a very simple algebraic structure.

- Using `crc32(key || message)` as a MAC is **completely broken**:
    - You can model it as a matrix multiplication.
    - With one authenticated message you can recover the internal state after the key.
    - Then you can forge valid tags for any message, without knowing the key.

On top of that:
- CRC32 is easy to invert on small messages; we can craft data that has any CRC32 we want.
- That’s how we built 16-byte blocks matching the “cognitive reminder” checksums.

So the whole challenge is basically:
“Look what happens when you treat a checksum like a cryptographic hash/MAC.”

Bye Roockbye
