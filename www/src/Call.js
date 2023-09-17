import React, { useState, useEffect, useRef } from 'react';
import { socket } from "./socket";
import { useParams } from "react-router-dom";
import { Peer } from "peerjs";
import { PeerJsOptions } from './PeerJsOptions';
import { Video } from "./Video";

export function Call(props){
    const [peers, setPeers] = useState([]);
    const [status, setStatus] = useState("start");
    const [roomName, setRoomName] = useState(useParams().roomName);
    const localPeer = useRef(null);

    useEffect(()=>{
        if (localPeer.current == null) {
            var peer = new Peer(PeerJsOptions);
            peer.on('error', (error) => {
                console.error(error);
            });
            peer.on("open", id=>{
                console.log(id);
                setStatus("connecting");
                OnPeerJsConnected(id);
            });
            localPeer.current = peer;
        }
        
    },[localPeer]);

    if(status === "start"){
        
        return (<p>Connecting to PeerJs...</p>);
    }
    else if (status === "connecting") {
        return (<p>Connecting to signalling server...</p>);
    }
    else if(status === "joining"){

        return (<p>Joining...</p>);
    }


    console.log(peers);
    return (
    <div>
        {peers.map(p=><Video srcObject={p.video} key={p.key} autoPlay/>)}
    </div>
    );

    async function OnPeerJsConnected(id){
        socket.on("connected",()=>{
            OnSocketConnected(id);
        });

        socket.connect();

        setStatus("connecting");
    }

    function OnSocketConnected(id){
        socket.on("peerJsIdSet",OnPeerJsIdSet);
        socket.emit("setPeerJsId", id);
    }

    function OnPeerJsIdSet(){
        const peer = localPeer.current;
        
        // Handle incoming voice/video connection
        peer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
                .then((stream) => {
                call.answer(stream); // Answer the call with an A/V stream.
                call.on('stream', video => {
                    setPeers(peers=>peers.filter(x=>x.key!=call.peer).concat({key: call.peer, video: video}));
                });
                })
                .catch((err) => {
                console.error('Failed to get local stream', err);
                });
        });
        socket.on("peerConnect", OnPeerConnect);
        socket.on("peerDisconnect",OnPeerDisconnect);
        socket.emitWithAck("joinRoom",roomName).then(()=>{
            setStatus("joined");
        });
        setStatus("joining");
    }

    function OnPeerDisconnect(peerId){
        setPeers(peers=>peers.filter(x=>x.key!=peerId));
    }

    function OnPeerConnect(peerId){
        console.log(peerId+" connected");
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((stream) => {
            let call = localPeer.current.call(peerId, stream);
            call.on('stream', video => {
                    setPeers(peers=>peers.filter(x=>x.key!=call.peer).concat({key: call.peer, video: video}));
                });
            })
            .catch((err) => {
            console.log('Failed to get local stream', err);
        });
    }

}