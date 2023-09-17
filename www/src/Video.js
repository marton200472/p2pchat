import { VideoHTMLAttributes, useEffect, useRef } from 'react'


export function Video({ srcObject, ...props }) {
  const refVideo = useRef(null);

  useEffect(() => {
    if (!refVideo.current) return
    refVideo.current.srcObject = srcObject
  }, [srcObject]);

  return (<video ref={refVideo} {...props} />);
}