#!/usr/bin/env python3
from pathlib import Path
N_BITS=32

def get_bit(x,i): return (x>>i)&1

def gauss_xor(rows,n_vars):
    rows=rows[:]
    piv=[-1]*n_vars
    r=0
    for col in range(n_vars):
        pivot=None
        for i in range(r,len(rows)):
            if (rows[i]>>col)&1:
                pivot=i; break
        if pivot is None: continue
        rows[r],rows[pivot]=rows[pivot],rows[r]
        piv[col]=r
        for i in range(len(rows)):
            if i!=r and ((rows[i]>>col)&1): rows[i]^=rows[r]
        r+=1
    sol=[0]*n_vars
    for col in range(n_vars):
        if piv[col]!=-1:
            sol[col]= (rows[piv[col]]>>n_vars)&1
    return sol

def main():
    sfile=Path('keystream_leak.txt')
    if not sfile.exists():
        print('missing keystream_leak.txt'); return
    states=[int(l.strip()) for l in sfile.read_text().splitlines() if l.strip()]
    n_states=len(states)
    n_A=N_BITS*N_BITS
    n_B=N_BITS
    n_vars=n_A+n_B
    rows=[]
    for t in range(n_states-1):
        s=states[t]; s2=states[t+1]
        for out in range(N_BITS):
            eq=0
            for j in range(N_BITS):
                if get_bit(s,j): eq ^= 1<<(out*N_BITS + j)
            eq ^= 1 << (n_A+out)
            if get_bit(s2,out): eq ^= 1<<n_vars
            rows.append(eq)
    sol=gauss_xor(rows,n_vars)
    A=[]
    for out in range(N_BITS):
        v=0
        for j in range(N_BITS):
            if sol[out*N_BITS+j]: v |= 1<<j
        A.append(v)
    B=0
    for i in range(N_BITS):
        if sol[n_A+i]: B |= 1<<i
    Path('A_rows.txt').write_text('
'.join(hex(x) for x in A))
    Path('B.txt').write_text(hex(B))
    print('A and B written')

if __name__=='__main__': main()
