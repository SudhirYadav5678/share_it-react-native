import 'react-native-get-random-values'
import { createContext, FC, useCallback, useContext, useState } from "react";
import { useChunkStore } from "../db/ChunkStore";
import TcpSocket from 'react-native-tcp-socket'
import DeviceInfo from "react-native-device-info";
import { Alert, Platform } from "react-native";
import RNFS from 'react-native-fs'
import { v4 as uuidv4 } from 'uuid'
import { produce } from 'immer'
import { receiveChnkAck, receivedFilesAck, sendChunkAck } from './TCPUtils';

interface TCPContextType {
    server: any;
    client: any;
    isConnected: boolean;
    connectedDevice: any;
    sentFiles: any;
    receivedFiles: any;
    totalSentBytes: number;
    totalReceivedBytes: number;
    startServer: (port: number) => void;
    connectToServer: (host: string, port: number, deviceName: string) => void;
    sendMessage: (message: string | Buffer) => void;
    sendFileAck: (file: any, type: 'file' | 'image') => void;
    disconnect: () => void;
}

const TCPContext = createContext<TCPContextType | undefined>(undefined)

export const useTCP = (): TCPContextType => {
    const context = useContext(TCPContext)
    if (!context) {
        throw new Error('useTCP must be used within a TCPProvider')
    }
    return context;
}

const options = {
    keystore: require('../tls_certs/server-keystore.p12')
}

export const TCPProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [server, setServer] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [isConnected, setIsConnected] = useState<any>(null);
    const [connectedDevice, setConnectedDevice] = useState<any>(null);
    const [serverSocket, setServerSocket] = useState<any>(null);
    const [sentFiles, setSendFiles] = useState<any>(null);
    const [receivedFiles, setReceivedFiles] = useState<any>(null);
    const [totalSentBytes, setTotalSentBytes] = useState<number>(0);
    const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);

    const { currentChunkSet, setCurrentChunkSet, setChunkStore } = useChunkStore();

    //start server
    const startServer = useCallback((port: number) => {
        if (server) {
            console.log("Server already running");
            return;
        }

        const newServer = TcpSocket.createTLSServer(options, (socket) => {
            console.log("Client Connected:", socket.address());
            setServerSocket(socket)
            socket.setNoDelay(true)
            socket.readableHighWaterMark = 1024 * 1024 * 1;
            socket.writableHighWaterMark = 1024 * 1024 * 1;

            socket.on('data', async (data) => {
                const parsedData = JSON.parse(data?.toString())

                if (parsedData?.event === 'connect') {
                    setIsConnected(true)
                    setConnectedDevice(parsedData?.deviceName)
                }

                if (parsedData?.event === 'file_ack') {
                    receivedFilesAck(parsedData?.file, socket, setReceivedFiles)
                }

                if (parsedData?.event === 'send_chunk_ack') {
                    sendChunkAck(parsedData?.file, socket, setTotalReceivedBytes, setSendFiles)
                }

                if (parsedData?.event === 'receive_chunk_ack') {
                    receiveChnkAck(parsedData?.chunkNo, parsedData?.chunk, socket, setTotalReceivedBytes, generateFile);
                }
            })

            socket.on('close', () => {
                console.log("Client disconnected");
                setReceivedFiles([])
                setSendFiles([])
                setCurrentChunkSet(null)
                setTotalReceivedBytes(0)
                setChunkStore(null)
                setIsConnected(false)
                disconnect()

            })

            socket.on('error', (error) => {
                console.error("socket error ", error);

            })
        })

        newServer.listen({ port, host: '0.0.0.0' }, () => {
            const address = newServer.address();
            console.log(`Server is running on${address?.address}:${address?.port}`);
        })

        newServer.on('error', (error) => console.error("Server error ", error));
        setServer(newServer);
    }, [server])


    //start client
    const connectToServer = useCallback((host: string, port: number, deviceName: string) => {
        const newClient = TcpSocket.connectTLS({
            host,
            port,
            cert: true,
            ca: require('../../tls_certs/server-cert.pem')
        }, () => {
            setIsConnected(true)
            setConnectedDevice(deviceName)
            const myDeviceName = DeviceInfo.getDeviceNameSync()
            newClient.write(JSON.stringify({ event: 'connect', deviceName: myDeviceName }))
        })

        newClient.setNoDelay(true)
        newClient.readableHighWaterMark = 1024 * 1024 * 1;
        newClient.writableHighWaterMark = 1024 * 1024 * 1;

        newClient.on('data', async (data) => {
            const parsedData = JSON.parse(data?.toString())
            if (parsedData?.event === 'file_ack') {
                receivedFilesAck(parsedData?.file, newClient, setReceivedFiles)
            }

            if (parsedData?.event === 'file_ack') {
                receivedFilesAck(parsedData?.file, newClient, setReceivedFiles)
            }

            if (parsedData?.event === 'send_chunk_ack') {
                sendChunkAck(parsedData?.file, newClient, setTotalReceivedBytes, setSendFiles)
            }

            if (parsedData?.event === 'receive_chunk_ack') {
                receiveChnkAck(parsedData?.chunkNo, parsedData?.chunk, newClient, setTotalReceivedBytes, generateFile);
            }

        })

        newClient.on('close', () => {
            console.log("Connection closed");
            setReceivedFiles([])
            setSendFiles([])
            setCurrentChunkSet(null)
            setTotalReceivedBytes(0)
            setChunkStore(null)
            setIsConnected(false)
            disconnect()

        })
        newClient.on('error', (error) => console.error("Error in connection"))
        setClient(newClient);
    }, [client])


    //disconnect 
    const disconnect = useCallback(() => {
        if (client) {
            client.destroy();
        };
        if (server) {
            server.close();
        }
    }, [client, server])


    //send Message
    const sendMessage = useCallback((message: string | Buffer) => {
        if (client) {
            client.write(JSON.stringify(message))
            console.log("sent from client ", message);
        }
        else if (server) {
            serverSocket.write(JSON.stringify(message))
            console.log("sent from server ", message);
        } else {
            console.error("No connection found");

        }
    }, [client, server])


    //send file Ack
    const sendFileAck = async (file: any, type: 'image' | 'file') => {
        if (currentChunkSet != null) {
            Alert.alert("Wait for current file to be sent!")
            return
        }
        const normalizedPath = Platform.OS === 'ios' ? file?.uri?.replace('file://', "") : file?.uri

        const fileData = await RNFS.readFile(normalizedPath, 'base64')
        const buffer = Buffer.from(fileData, 'base64')
        const CHUNK_SIZE = 1024 * 8;
        let totalChunk = 0;
        let offset = 0;
        let chunkArray = [];

        while (offset < buffer.length) {
            const chunk = buffer.slice(offset, offset + CHUNK_SIZE)
            totalChunk += 1;
            chunkArray.push(chunk);
            offset += chunk.length;

        }

        const rawData = {
            id: uuidv4(),
            name: type === 'file' ? file?.name : file?.fileName,
            size: type === 'file' ? file?.size : file?.fileSize,
            mimeType: type === 'file' ? 'file' : '.jpg',
            totalChunk
        };

        setCurrentChunkSet({
            id: rawData?.id,
            chunkArray,
            totalChunk
        })

        setSendFiles((prevData: any) => produce(prevData, (draft: any) => {
            draft.push({
                ...rawData,
                uri: file?.uri
            })
        }))

        const socket = client || serverSocket;
        if (!socket) return;
        try {
            console.log("file acknowledged done ✅");
            socket.write(JSON.stringify({ event: 'file_ack', file: rawData }))
        } catch (error) {
            console.error("Error in sending file ", error);

        }
    }

    //Generate file
    const generateFile = async () => {
        const { chunkStore, resetChunkStore } = useChunkStore.getState()

        if (!chunkStore) {
            console.log("No chunk or file to process");
            return;
        }

        if (chunkStore?.totalChunks !== chunkStore.chunkArray.length) {
            console.log("Not all chunk received");
            return;
        }

        try {
            const combinedChunks = Buffer.concat(chunkStore.chunkArray);
            const platformPath = Platform.OS == 'ios' ? `${RNFS.DocumentDirectoryPath}` : `${RNFS.DownloadDirectoryPath}`

            const filePath = `${platformPath}/${chunkStore.name}`
            await RNFS.writeFile(filePath, combinedChunks?.toString('base64'), 'base64')

            setReceivedFiles((prevFiles: any) => produce(prevFiles, (draftFiles: any) => {
                const fileIndex = draftFiles?.findIndex((f: any) => f.id === chunkStore.id)
                if (fileIndex !== -1) {
                    draftFiles[fileIndex] = {
                        ...draftFiles[fileIndex], uri: filePath,
                        available: true
                    }
                }
            }))

            console.log("File saved succssfully");
            resetChunkStore();
        } catch (error) {
            console.error("Error while combining files", error);

        }
    }

    return (
        < TCPContext.Provider value={{
            server,
            client,
            connectedDevice,
            sentFiles,
            receivedFiles,
            totalReceivedBytes,
            totalSentBytes,
            isConnected,
            startServer,
            connectToServer,
            disconnect,
            sendMessage,
            sendFileAck
        }}
        >
            {children}
        </TCPContext.Provider >
    )
}