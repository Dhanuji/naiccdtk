import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  Image,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useLayoutEffect} from 'react';

import YoutubeIframe, {getYoutubeMeta} from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import YoutubePlayer from 'react-native-youtube-iframe';

const videoSeries = [
  
  '69tMHUt58W8',
  'QOotjgWBaiY',
  '6SDtvXliIqk',
  'Y-1x9H3c1io',
  'aVoa8rQiSFE',
  'ZD2vVGgnMKU',
  '2vu5Cf0FbfM',
];

const Bprouduct = () => {
  const navigation = useNavigation();

  const [modalVisible, showModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [progress, setProgress] = useState(0);

  const onVideoPress = useCallback(videoId => {
    showModal(true);
    setSelectedVideo(videoId);
  }, []);

  useEffect(() => {
    getProgress().then(p => {
      setProgress(p);
      
    }); 
   
  }, [modalVisible]);

  const closeModal = useCallback(() => showModal(false), []);

  return (
   
      <SafeAreaView>
    <ScrollView>
    
        <FlatList
         scrollEnabled={false}
          contentContainerStyle={{margin: 16}}
          ListHeaderComponent={
            <YoutubePlayer
              height={250}
              videoId={'I9kFlWDy6nM'}
              style={{flex: 1}}
            />
          }
          data={videoSeries}
          renderItem={({item}) => (
            <VideoItem videoId={item} onPress={onVideoPress} />
          )}
          keyExtractor={item => item}
        />
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={closeModal}>
          <VideoModal videoId={selectedVideo} onClose={closeModal} />
        </Modal>
       </ScrollView>
      
      </SafeAreaView>
    
  );
};

const getProgress = async () => {
  const total = videoSeries.length;
  let completed = 0;
  for (let i = 0; i < total; i++) {
    const videoId = videoSeries[i];
    const status = await getVideoProgress(videoId);
    if (status?.completed) {
      completed += 1;
    }
  }
  return completed / total;
};

const ProgressBar = ({progress}) => {
  const width = (progress || 0) + '%';
  return (
    <View style={{borderWidth: 1, marginVertical: 16}}>
      <View
        style={{
          backgroundColor: 'green',
          height: 10,
          width,
        }}
      />
    </View>
  );
};

const VideoItem = ({videoId, onPress}) => {
  const [videoMeta, setVideoMeta] = useState(null);
  useEffect(() => {
    getYoutubeMeta(videoId).then(data => {
      setVideoMeta(data);
    });
  }, [videoId]);

  if (videoMeta) {
    return (
      <TouchableOpacity
        onPress={() => onPress(videoId)}
        style={{flexDirection: 'row', marginVertical: 16}}>
        <Image
          source={{uri: videoMeta.thumbnail_url}}
          style={{
            width: videoMeta.thumbnail_width / 4,
            height: videoMeta.thumbnail_height / 4,
          }}
        />
        <View style={{justifyContent: 'center', marginStart: 16,width: 200}}>
          <Text style={{marginVertical:4, fontWeight: 'bold'}}>
            {videoMeta.title}
          </Text>
          <Text>{videoMeta.author_name}</Text>
        </View>

        
      </TouchableOpacity>
    );
  }
  return null;
};

const VideoModal = ({videoId, onClose}) => {
  const playerRef = useRef(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      playerRef.current?.getCurrentTime().then(data => {
        saveVideoProgress({
          videoId,
          completed,
          timeStamp: data,
          
        });
      });
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  }, [videoId, completed]);

  const onPlayerReady = useCallback(() => {
    getVideoProgress(videoId).then(data => {
      if (data.timeStamp) {
        playerRef.current?.seekTo(data.timeStamp);
      }
    });
  }, [videoId]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000000dd',
        justifyContent: 'center',
      }}>
      <View style={{backgroundColor: 'white', padding: 16}}>
        <Text onPress={onClose} style={{textAlign: 'right'}}>
          Close
        </Text>
        <YoutubeIframe
          ref={playerRef}
          play={true}
          videoId={videoId}
          height={250}
          onReady={onPlayerReady}
          onChangeState={state => {
            if (state === 'ended') {
              setCompleted(true);
            }
          }}
        />
      </View>
    </View>
  );
};

const saveVideoProgress = ({videoId, completed, timeStamp}) => {
  const data = {
    completed,
    timeStamp,
  };

  return AsyncStorage.setItem(videoId, JSON.stringify(data));
  
};

const getVideoProgress = async videoId => {
  const json = await AsyncStorage.getItem(videoId);
  if (json) {
    return JSON.parse(json);

    
  }
  
  return {
    completed: false,
    timeStamp: 0,

    
  };

  
};


export default Bprouduct;
