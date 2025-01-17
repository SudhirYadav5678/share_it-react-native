import { View, Text, StyleSheet, Image, } from 'react-native'
import React from 'react'
import CustomText from './CustomText'
import { commonStyles } from '../../styles/commonStyles'

const Misc = () => {
    return (
        <View style={styles.continer}>
            <CustomText fontSize={13} fontFamily='Okra-Bold'>
                Explore
            </CustomText>
            <Image style={styles.adBanner} source={require("../../assets/icons/wild_robot.jpg")} />

            <View style={commonStyles.flexRowBetween}>
                <CustomText fontFamily='Okra-Bold' fontSize={22} style={styles.text}>
                    #1 world best file sharing app!
                </CustomText>
                <Image source={require('../../assets/icons/share_logo.jpg')} style={styles.image} />
            </View>
            <CustomText fontFamily='Okra-Bold' fontSize={12} style={styles.text2}>
                Made with ❤️ Sudhir Yadav
            </CustomText>
        </View >
    )
}
const styles = StyleSheet.create({
    continer: {
        paddingVertical: 20
    },
    adBanner: {
        width: '100%',
        height: 120,
        resizeMode: "cover",
        borderRadius: 20,
        marginVertical: 25,

    },
    text: {
        opacity: 0.5,
        width: '60%'
    },
    text2: {
        opacity: 0.5,
        width: '60%',
        marginTop: 10
    },
    image: {
        resizeMode: "contain",
        height: 120,
        width: '35%'
    }
})
export default Misc