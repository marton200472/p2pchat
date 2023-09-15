import React, { useState, useEffect, useRef } from 'react';
import { socket } from "./socket";
import { useParams } from "react-router-dom";
import { Peer } from "peerjs";
import { PeerJsOptions } from './PeerJsOptions';

export function Call(){
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [peers, setPeers] = useState([]);
    const localPeer = useRef();
    const [incomingVideo, setIncomingVideo]=useState();
    
    const [roomName,setRoomName] = useState(useParams().roomName);

    console.log("Component");

    function onConnect() {
        setIsConnected(true);
        
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
      setIsConnected(false);
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
      }, [setRoomName]);


    return (<video id='incomingvideo' autoPlay></video>);
}