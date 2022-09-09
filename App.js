import { View, Text, Button, StyleSheet, PermissionsAndroid, ImageBackground, ActivityIndicator, Image, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import Geolocation from '@react-native-community/geolocation'
import IonIcon from 'react-native-vector-icons/Ionicons'
import axios from 'axios'


const App = () => {
  const [refreshing, setRefreshing] = useState(false);

  const [currentLatitude, setCurrentLatitude] = React.useState('');
  const [currentLongitude, setCurrentLongitude] = React.useState('');
  const [locationStatus, setLocationStatus] = React.useState('')

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState([]);

  const [iconWeather, setIconWeather] = useState('');
  const [currentIconWeather, setCurrentIconWeather] = useState('');

  const currentHour = new Date().getHours().toString();
  const [time, setTime] = useState(false);

  const [iconName, setIconName] = useState();

  const api = {
    key: 'aab77b1efa83401cf064f96662d95239',
    baseUrl: 'https://api.openweathermap.org/data/2.5/'
  }
  const citys = ['New York', 'İstanbul', 'Roma','SAO PAULO','ABU DABİ','Paris','MİLANO','MEKSİKO','Madrid']
  const [count, setCount] = useState(0)

  const counterCity = () => {
    if (count == 8) {
      console.log(count, 'count ne gelio')
      return setCount(0)
    } else {
      setCount(count + 1)
    }
    console.log(count, 'count ne gelio')
  }

  const timeConnect=()=>{
    if(currentHour>17){
      setTime(true);
    }else{
      setTime(false)
    }
  }

  const fetchDataHandler = useCallback(() => {
    console.log('fire');
    counterCity();
    setLoading(true);
    axios({
      method: 'GET',
      url: `https://api.openweathermap.org/data/2.5/weather?q=${citys[count]}&appid=${api.key}`
    }).then(res => {
      console.log(res.data, ' hob');
      setData(res.data);
      setIconWeather(res.data.weather[0]?.icon);
    }).catch(e => console.dir(e))
      .finally(() => setLoading(false));
  }, [api.key, citys[count]]);

  const currentFetchDataHandler = useCallback((a,b) => {
    console.log(a,'firerrrrrrr');
    setLoading(true);
    axios({
      method: 'GET',
      url: `https://api.openweathermap.org/data/2.5/weather?lat=${a}&lon=${b}&appid=${api.key}`
    }).then(res => {
      console.log(res.data, ' currrent hob');
      setCurrentData(res.data);
      setCurrentIconWeather(res.data.weather[0].icon)
      setIconName(res.data.weather[0]?.icon)
      console.log('data atıldı');
    }).catch(e => console.dir(e))
      .finally(() => setLoading(false));
  }, [api.key, currentLatitude, currentLongitude]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDataHandler();
    setRefreshing(false)
  }

  const changeBgImg =(iconName)=>{
      if(iconName=='01d' || iconName=='01n'){
        return require('./src/assets/sunny.jpg')
      }else if(iconName=='03d' || iconName=='03n'){
        return require('./src/assets/bulut.jpg')
      }else if(iconName=='04d' || iconName=='04n'){
        return require('./src/assets/bulut.jpg')
      }else if(iconName=='09d' || iconName=='09n' || iconName=='10d' || iconName=='10n' || iconName=='11d' || iconName=='11n'){
        return require('./src/assets/yagmur.jpg')
      }else if(iconName=='13d' || iconName=='13n'){
        return require('./src/assets/snowy.jpg')
      }
    }

  const getOneTimeLocation = useCallback(() => {
    setLocationStatus('Getting Location...');
    Geolocation.getCurrentPosition((position) => {
      setLocationStatus('You are Here');
      const currentLongitude = JSON.stringify(position.coords.longitude);
      const currentLatitude = JSON.stringify(position.coords.latitude);
      setCurrentLongitude(currentLongitude);
      setCurrentLatitude(currentLatitude);
      console.log(currentLatitude,'lati ko ko')
      if(currentLatitude.length>0 && currentLongitude>0){
        console.log('içleri doldu')
        currentFetchDataHandler(currentLatitude,currentLongitude)
      }

    }, (error) => {
      setLocationStatus(error.message);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    })
  })

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location Access Required',
          message: 'This App needs to Access your location',
        },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getOneTimeLocation();
          setCurrentLatitude(currentLatitude);
          setCurrentLongitude(currentLongitude);
          if(currentLatitude.length>0 && currentLongitude>0){
            console.log(currentLatitude, 'latii');
            console.log(currentLongitude,'longiiii')
            //currentFetchDataHandler()
          }
          timeConnect();
          fetchDataHandler()
        } else {
          setLocationStatus('Permission Denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };
    requestLocationPermission();
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <ImageBackground imageStyle={{overlayColor:'rgba(69,85,117)'}} style={styles.imgBg} source={changeBgImg(iconName)} resizeMode='cover'>
      <View style={styles.overlay}>
      <View style={styles.header}>
        <View style={{flexDirection:'row',padding:10}}>
        <IonIcon style={{flex:1,}} name="search-outline" size={40} color='black'></IonIcon>
        <IonIcon name="menu-outline" size={40} color='black'></IonIcon>
        </View>
      
      {loading &&
        <View style={styles.mid}>
          <ActivityIndicator size={'large'} color={'#000'}></ActivityIndicator>
        </View>
      }
      {currentData &&
        <View>
          <View style={styles.currentContainer}>
          <Text style={styles.txtCurrentCity}>{currentData?.name}, {currentData?.sys?.country}</Text>
          <Text style={styles.dateTextC}>{new Date().toLocaleDateString()} -- {new Date().getHours().toString()}:{new Date().getMinutes().toString()}</Text>
          </View>
          <View style={styles.currentBottom}>
          <Text style={styles.tempTextC}>{`${Math.round(currentData?.main?.temp - 273.15)} ℃`}</Text>
          <View style={{flexDirection:'row',justifyContent:'center'}}>
            {time ? (<IonIcon name="moon-outline" size={45} color='white'></IonIcon>):(<IonIcon name="sunny-outline" size={45} color='white'></IonIcon>)}
   
          <Image style={{width:90,height:90,bottom:20}} resizeMode='contain' source={{uri:`http://openweathermap.org/img/wn/${currentIconWeather}.png`}}></Image>
          
          </View>
          </View>
        </View>
      }
      </View>
      <View>
        {data && <View style={styles.bottomContainer}>
              <Text style={styles.otherTxtName}>{data?.name}</Text>
              <View style={{flexDirection:'column',alignItems:'center',marginHorizontal:8}}>
              <Text style={styles.tempText}>{`${Math.round(data?.main?.temp - 273.15)} ℃`}</Text>
              <Text style={styles.minMaxText}>{`Min ${Math.round(data?.main?.temp_min - 273.15,)} ℃ / Max ${Math.round(data?.main?.temp_max - 273.15)}`}</Text>
              </View>
              <Image style={{width:70,height:70}} source={{uri:`http://openweathermap.org/img/wn/${iconWeather}.png`}} resizeMode='cover'></Image>
          </View>}
      </View>
      </View>
      </ImageBackground>
    </ScrollView>


  )
}
export default App

const styles = StyleSheet.create({
  container: { flex: 1 },
  imgBg: { flex: 1 },
  header:{
    height:'75%',
    borderBottomWidth:1.5,
    borderBottomColor:'#e0e0e0',
    margin:10
  },
  overlay:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(69,85,117,0.6)',
  },
  currentContainer:{
    margin:10
  },
  txtCurrentCity:{
    color:'white',
    fontSize:60,
    fontFamily:'sans-serif'
  },
  dateTextC:{
    color:'white',
    fontSize: 17,
    fontFamily:'sans-serif'
  },
  tempText:{
    color:'white',
    fontFamily:'sans-serif-light',
    fontSize:35,
  },
  tempTextC:{
    color:'white',
    fontFamily:'sans-serif-light',
    fontSize:65,
  },
  currentBottom:{
    position:'absolute',
    top:'270%',
    margin:10
  },
  bottomContainer:{
    flexDirection:'row',
    justifyContent:'center',
    top:25
  },
  otherTxtName:{
    color:'white',
    fontSize:20,
    padding:10
  },
  minMaxText:{
    color:'white',
    fontFamily:'sans-serif-light',
    fontSize:15
  }
  

})