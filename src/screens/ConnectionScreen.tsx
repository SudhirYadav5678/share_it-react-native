import { View, Text, Touchable, TouchableOpacity, FlatList, ActivityIndicator, Platform, SafeAreaView } from 'react-native'
import React, { FC, useEffect, useState } from 'react'
import { useTCP } from '../services/TCPProvider'
import Icon from '../components/global/Icon'
import { sendStyles } from '../styles/sendStyles'
import LinearGradient from 'react-native-linear-gradient'
import { connectionStyles } from '../styles/connectionStyles'
import CustomText from '../components/global/CustomText'
import Options from '../components/home/Options'
import { resetAndNavigate } from '../utils/NavigationUtil'
import { formatFileSize } from '../utils/libraryHelpers'
import { Colors } from '../utils/Constants'
import ReactNativeBlobUtil from 'react-native-blob-util'


const ConnectionScreen: FC = () => {

    const {
        connectedDevice,
        disconnect,
        sendFileAck,
        sentFiles,
        receivedFiles,
        totalReceivedBytes,
        totalSentBytes,
        isConnected
    } = useTCP()
    const [activeTab, setActiveTab] = useState<'SENT' | "RECEIVED">('SENT')

    const renderThumbnail = (mimeType: string) => {
        switch (mimeType) {
            case '.mp3':
                return <Icon name='musical-notes' size={16} color='blue' iconFamily='Ionicons' />
            case '.mp4':
                return <Icon name='videocam' size={16} color='green' iconFamily='Ionicons' />
            case '.jpg':
                return <Icon name='image' size={16} color='ornge' iconFamily='Ionicons' />
            case '.pdf':
                return <Icon name='document' size={16} color='red' iconFamily='Ionicons' />
            default:
                return <Icon name='folder' size={16} color='gray' iconFamily='Ionicons' />
        }
    }

    const onMediaPickUp = (image: any) => {
        console.log('Picked image:', image);
        sendFileAck(image, "image")
    }
    const onFilePickedUp = (file: any) => {
        console.log('Picked file:', file);
        sendFileAck(file, "file")
    }

    useEffect(() => {
        if (!isConnected) {
            resetAndNavigate('HomeScreen')
        }
    }, [isConnected])

    const handleTapChange = (tab: 'SENT' | 'RECEIVED') => {
        setActiveTab(tab);
    }

    const renderItem = ({ item }: any) => {
        return (
            <View style={connectionStyles.fileItem}>
                <View style={connectionStyles.fileInfoContainer}>
                    {renderThumbnail(item?.mimeType)}
                </View>
                <View style={connectionStyles.fileDetails}>
                    <CustomText numberOfLines={1} fontFamily='Okra-Bold' fontSize={10}>
                        {item?.name}
                    </CustomText>
                    <CustomText numberOfLines={1} fontFamily='Okra-Bold' fontSize={10}>
                        {item?.mimeType}・{formatFileSize(item.size)}
                    </CustomText>
                </View>
                {item?.available ? (
                    <TouchableOpacity onPress={() => {
                        const normalizePath = Platform.OS === 'ios' ? `file://${item?.uri}` : item?.uri;
                        if (Platform.OS === 'ios') {
                            ReactNativeBlobUtil.ios.openDocument(normalizePath)
                                .then(() => console.log("File open"))
                                .catch(err => console.log("Error while file opening", err)
                                )
                        } else {
                            ReactNativeBlobUtil.android.actionViewIntent(normalizePath, "*/*")
                                .then(() => console.log("File open"))
                                .catch(err => console.log("Error while file opening", err)
                                )
                        }
                    }} style={connectionStyles.openButton}>
                        <CustomText numberOfLines={1} color='#fff' fontFamily='Okra-Bold' fontSize={10}>
                            Open
                        </CustomText>
                    </TouchableOpacity>
                ) : (
                    <ActivityIndicator color={Colors.primary} size='small' />
                )}
            </View>
        )
    }
    return (
        <LinearGradient
            colors={['#FFFFFF', '#CDDAEE', '#8DBAFF']}
            style={sendStyles.container}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}>
            <SafeAreaView />
            <View style={sendStyles.mainContainer}>
                <View style={connectionStyles.container}>
                    <View style={connectionStyles.connectionContainer}>
                        <View style={{ width: '55%' }}>
                            <CustomText numberOfLines={1} fontFamily='Okra-Medium'>
                                Connected with
                            </CustomText>

                            <CustomText numberOfLines={1} fontFamily='Okra-Bold'>
                                {connectedDevice || "unknown"}
                            </CustomText>
                        </View>

                        <TouchableOpacity onPress={() => disconnect()} style={connectionStyles.disconnectButton}>
                            <Icon name='remove-circle' size={12} color='red' iconFamily='Ionicons' />
                            <CustomText numberOfLines={1} fontFamily='Okra-Bold' fontSize={10}>Disconnect</CustomText>
                        </TouchableOpacity>
                    </View>
                    <Options onMediaPickup={onMediaPickUp} onFilePickedUp={onFilePickedUp} />

                    <View style={connectionStyles.fileContainer}>
                        <View style={connectionStyles.sendReceiveButton}>
                            <View style={connectionStyles.sendReceiveButton}>
                                <TouchableOpacity onPress={() => handleTapChange('SENT')} style={[
                                    connectionStyles.sendReceiveButton,
                                    activeTab === 'SENT' ? connectionStyles.activeButton : connectionStyles.inactiveButton
                                ]}>
                                    <Icon name='cloud-upload' size={12} color={activeTab === 'SENT' ? '#fff' : 'blue'} iconFamily='Ionicons' />
                                    <CustomText numberOfLines={1} fontFamily='Okra-Bold' fontSize={9} color={activeTab === 'SENT' ? '#fff' : 'blue'}>
                                        SENT
                                    </CustomText>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => handleTapChange('RECEIVED')} style={[
                                    connectionStyles.sendReceiveButton,
                                    activeTab === 'RECEIVED' ? connectionStyles.activeButton : connectionStyles.inactiveButton
                                ]}>
                                    <Icon name='cloud-upload' size={12} color={activeTab === 'RECEIVED' ? '#fff' : 'blue'} iconFamily='Ionicons' />
                                    <CustomText numberOfLines={1} fontFamily='Okra-Bold' fontSize={9} color={activeTab === 'RECEIVED' ? '#fff' : 'blue'}>
                                        RECEIVED
                                    </CustomText>
                                </TouchableOpacity>
                            </View>

                            <View style={connectionStyles.sendReceiveDataContainer}>
                                <CustomText fontFamily='Okra-Bold' fontSize={9}>
                                    {formatFileSize((activeTab === 'SENT' ? totalSentBytes : totalReceivedBytes) || 0)}
                                </CustomText>
                                <CustomText fontFamily='Okra-Bold' fontSize={12}>/</CustomText>
                                <CustomText fontFamily='Okra-Bold' fontSize={10}>
                                    {
                                        activeTab === 'SENT' ? formatFileSize(sentFiles?.reduce((total: number, file: any) => total + file.size, 0)) :
                                            formatFileSize(receivedFiles?.reduce((total: number, file: any) => total + file.size, 0))
                                    }
                                </CustomText>
                            </View>
                        </View>

                        {
                            (activeTab === 'SENT' ? sentFiles?.length : receivedFiles?.length) > 0 ? (
                                <FlatList
                                    data={activeTab === 'SENT' ? sentFiles : receivedFiles}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderItem}
                                    contentContainerStyle={connectionStyles.fileList} >
                                </FlatList>
                            ) : (
                                <View style={connectionStyles.noDataContainer}>
                                    <CustomText numberOfLines={1} fontFamily='Okra-Medium' fontSize={11}>
                                        {activeTab === 'SENT' ? "No file sent yet" : "No file reveived yet"}
                                    </CustomText>
                                </View>
                            )
                        }
                    </View>
                </View>

                <TouchableOpacity onPress={() => resetAndNavigate('HomeScreen')} style={sendStyles.backButton}>
                    <Icon name='arrow-back' iconFamily='Ionicons' size={16} color='#000' />
                </TouchableOpacity>
            </View>

        </LinearGradient>
    )
}

export default ConnectionScreen