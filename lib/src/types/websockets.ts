export interface WebRtcAnswer {
  answerSdp: RTCSessionDescriptionInit;
  sid: string;
}

export interface WebRtcOffer {
  offerSdp: RTCSessionDescriptionInit;
  sid: string;
}

export interface WebRtcIceCandidate {
  candidate: string;
  label: number | null;
  sid: string;
}

export interface ClientEvents {
  joinRoom: (room: string) => void;
  setPeerJsId: (id: string) => void;
}

export interface ServerEvents {
  connected: () => void;
  peerJsIdSet: () => void;
  peerConnect: (sid: string) => void;
  peerDisconnect: (sid: string) => void;
}
