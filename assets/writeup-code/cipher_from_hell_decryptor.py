#!/usr/bin/env python3
ENC_HEX = '1a0b0e1a1d1e0a1d0a1a1d1e1a0b1a1d0a1d1e0a1a1d1e0a1d1e0a1a1d0a1a1d1e0a1a1d1e0a1d'

def rotr8(x,r):
    return ((x >> r) | ((x << (8 - r)) & 0xFF)) & 0xFF

for k in range(1,8):
    out = bytearray()
    for i in range(0, len(ENC_HEX), 2):
        c = int(ENC_HEX[i:i+2], 16)
        r = c ^ k
        out.append(rotr8(r, k))
    print('k=',k, '->', out)
