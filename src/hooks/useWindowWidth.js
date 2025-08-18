import { useState, useEffect } from 'react';

export default function useWindowWidth(defaultWidth = 1024) {
  const [w,setW] = useState(typeof window !== 'undefined' ? window.innerWidth : defaultWidth);
  useEffect(()=>{
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return ()=> window.removeEventListener('resize', h);
  },[]);
  return w;
}

