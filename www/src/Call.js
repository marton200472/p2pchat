import React, { useState, useEffect, useRef } from 'react';
import { socket } from "./socket";
import { useParams } from "react-router-dom";
import { Peer } from "peerjs";
import { PeerJsOptions } from './PeerJsOptions';

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

    /*useEffect(()=>{
        peers.forEach(p => {
            try {
                document.getElementById(p.key).srcObject=p.video;
                console.log("Set video for "+p.key);
            } catch (error) {
                console.log("Unable to set "+p.key);
            }
        });
    },[peers]);*/

    if(status === "start"){
        
        return (<p>Connecting to PeerJs...</p>);
    }
    else if (status === "connecting") {
        return (<p>Connecting to signalling server...</p>);
    }
    else if(status === "joining"){

        return (<p>Joining...</p>);
    }

    return (<div>
        {peers.map(p=><video key={p.key} autoPlay id={p.key} ref={v=>v.srcObject=p.video}></video>)}
    </div>);

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
                    setPeers(peers.concat({key: call.peer, video: video}));
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
        console.log(peerId+" disconnected");
    }

    function OnPeerConnect(peerId){
        console.log(peerId+" connected");
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((stream) => {
            let call = localPeer.current.call(peerId, stream);
            call.on('stream', video => {
                    /*if (!document.getElementById(call.peer)) {
                        var frame = document.createElement("video");
                        frame.setAttribute("autoplay","");
                        frame.id=peerId;
                        frame.srcObject=video;
                        document.body.appendChild(frame);
                    }*/
                    //document.querySelector("#incomingvideo");
                    
                    setPeers(peers.concat({key: peerId, video: video}));
                });
            })
            .catch((err) => {
            console.log('Failed to get local stream', err);
        });

        //setPeers(peers.concat({id: peerId}));
    }

}


/*export function Call(){
    const [peers, setPeers] = useState([]);
    const localPeer = useRef();
    
    const [roomName,setRoomName] = useState(useParams().roomName);

    console.log("Component");

    function onConnect() {
        //setIsConnected(true);
        
        let peer= new Peer(PeerJsOptions);
        
        peer.on('error', (error) => {
            console.error(error);
          });


        peer.on('connection', (conn) => {
            console.log('incoming peer connection!');
            conn.on('data', (data) => {
                console.log(`received: ${data}`);
            });
            conn.on('open', () => {
                conn.send('hello!');
            });
        });
        
        // Handle incoming voice/video connection
        peer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
                .then((stream) => {
                call.answer(stream); // Answer the call with an A/V stream.
                call.on('stream', video => {
                    if (!document.getElementById(call.peer)) {
                        var frame = document.createElement("video");
                        frame.setAttribute("autoplay","");
                        frame.id=call.peer;
                        frame.srcObject=video;
                        document.body.appendChild(frame);
                    }
                    
                });
                })
                .catch((err) => {
                console.error('Failed to get local stream', err);
                });
        });

        peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            localPeer.current=peer;
            console.log("local peer set");

            socket.on("peerJsIdSet",()=>{
                socket.emit("joinRoom",roomName);
                console.log("joining room");
            });

            socket.emit("setPeerJsId",id);
            

            
          });

        
        
    }

    function onDisconnect(sid) {
        console.log("Peer disconnecting "+sid);
    }

    function onPeerConnect(sid){
        console.log("Peer connected to room: "+sid);
        console.log(`Connecting to ${sid}...`);
        
        let conn = localPeer.current.connect(sid, PeerJsOptions);
        conn.on('data', (data) => {
            console.log(`received: ${data}`);
        });
        conn.on('open', () => {
            conn.send('hi!');
        });
        
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((stream) => {
            let call = localPeer.current.call(sid, stream);
            call.on('stream', video => {
                    if (!document.getElementById(call.peer)) {
                        var frame = document.createElement("video");
                        frame.setAttribute("autoplay","");
                        frame.id=sid;
                        frame.srcObject=video;
                        document.body.appendChild(frame);
                    }
                    //document.querySelector("#incomingvideo");
                });
            })
            .catch((err) => {
            console.log('Failed to get local stream', err);
        });
    }

    function onPeerDisconnect(id){
        try {
            document.getElementById(id).remove();
        } catch (error) {
            
        }
        
    }
 
    useEffect(() => {
        console.log("Use effect");

        socket.on('connected', onConnect);
        socket.on('disconnected', onDisconnect);
        socket.on("peerConnect", onPeerConnect);
        socket.on("peerDisconnect",onPeerDisconnect);
    
        return () => {
          socket.off('connected', onConnect);
          socket.off('disconnected', onDisconnect);
          socket.off("peerConnect", onPeerConnect);
          socket.off("peerDisconnect",onPeerDisconnect);
          socket.disconnect();
        };
      }, [localPeer]);


    return (
        <></>
    );
}*/