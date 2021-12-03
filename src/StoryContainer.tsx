import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  NativeTouchEvent,
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  FlatList
} from "react-native";

import { WebView } from "react-native-webview";
import Modal from "react-native-modalbox";
import GestureRecognizer from "react-native-swipe-gestures";
 import Video from 'react-native-video';

import Story from "./Story";
import UserView from "./UserView";
import onGoingLiveStreamBar from './onGoingLiveStreamBar';
import Readmore from "./Readmore";
import ProgressArray from "./ProgressArray";
import { StoriesType, StoryType } from ".";
import { OTSession, OTPublisher, OTSubscriber } from 'opentok-react-native';
 import EmojiSelector from 'react-native-emoji-selector'


 import AgoraUIKit from 'agora-rn-uikit';
// import RtmEngine from 'agora-react-native-rtm';
import { style } from "styled-system";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Props = {
  dataStories: StoriesType;
 // userDatas: StoriesType;
  onStoryNext: (boolean) => void;
  onStoryPrevious: (boolean) => void;
  onClose: () => void;
  isNewStory: boolean;
  textReadMore: string;
};

const StoryContainer: React.FC<Props> = (props: Props) => {
  const { dataStories, userDatas } = props;
  const { stories = [] } = dataStories || {};
  const { userdata = [] } = userDatas || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModelOpen, setModel] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [isLoaded, setLoaded] = useState(false);
  const [duration, setDuration] = useState(3);
  const [commentText,setCommentText] = useState("");
  const [signalChat,setSignalChat] = useState({
  
      data: '',
      type: '', 
    
  });
  const [messages,setMessages] = useState([]);
  const [chatDataObj,setChatDataObj] = useState([]);
  const [streamProperties, setStreamProperties] = useState({});
  
  const client = useState(null);//new RtmEngine()
  const [text,setText] = useState();

  //const sessionRef = useRef<typeof OTSession>(null);
  const sessionRef = useRef(null);

  const story = stories.length ? stories[currentIndex] : {};
  const { isReadMore }: StoryType = story || {};
    // const onVideoLoaded = (length) => {
  //   props.onVideoLoaded(length.duration);
  // };

  const changeStory = (evt: NativeTouchEvent) => {
    if (evt.locationX > SCREEN_WIDTH / 2) {
      nextStory();
    } else {
      prevStory();
    }
  };

  useEffect(() => 
  {
    console.log(JSON.stringify(userDatas))
    //sendSignal();
   // setIsLiveStreamLoading(true);
   }, [1]);

  const nextStory = () => {
    if (stories.length - 1 > currentIndex) {
      setCurrentIndex(currentIndex + 1);
      setLoaded(false);
      setDuration(3);
    } else {
      setCurrentIndex(0);
      props.onStoryNext(false);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0 && stories.length) {
      setCurrentIndex(currentIndex - 1);
      setLoaded(false);
      setDuration(3);
    } else {
      setCurrentIndex(0);
      props.onStoryPrevious(false);
    }
  };

 


  const onImageLoaded = () => {
    setLoaded(true);
  };

  const onVideoLoaded = (length) => {
    setLoaded(true);
    setDuration(length.duration);
  };

  const onPause = (result) => {
    setIsPause(result);
  };

  const onReadMoreOpen = () => {
    setIsPause(true);
    setModel(true);
  };
  const onReadMoreClose = () => {
    setIsPause(false);
    setModel(false);
  };

  
  
 
  

  const sendSignalAgora = () =>{

    const channel = useRef(client.createChannel("channelId")).current;

 
    messages.forEach((message: any) => {
      channel
        .sendChannelMessage({
          channel,
          message: `${message}`,
        })
        .then(() => {
         alert('send message');
           
        })
        .catch(() => {
          alert('send failured');
        });
    });
  
  }
  const sendSignal =  () => {

  //  setMessages(oldvalue => [commentText,...oldvalue] );
      
           /* setMessages({
              username:userDatas.user.username,
              message:commentText,
              avatar:userDatas.user.avatar
          });*/  

          setMessages([...messages, 
            {
              username:userDatas.user.username,
              message:commentText,
              avatar:userDatas.user.avatar
          }]);

        
       // console.log("<<<<<sendSignal>>>>"+JSON.stringify(messages)+"<<<<end sendSignal>>>>");


      sessionRef.current.signal(
        {
            type: 'msg',
            data: JSON.stringify(messages) //commentText+"-|-"+userDatas.user.avatar+"-|-"+userDatas.user.username,
        },
        function (error) {
             if (error) { 
             console.log('signal error: ' + error.message);
            } else { 
            console.log('signal sent');
            }
        }
    ); 

    setCommentText(" ");
        
  }; 

   
  
  
 

  const loading = () => {
    if (!isLoaded) {
      return (
        <View style={styles.loading}>
          <View>
            <Story
              onImageLoaded={onImageLoaded}
              pause
              onVideoLoaded={onVideoLoaded}
              story={story}
            />
          </View>
          <ActivityIndicator color="white" />
        </View>
      );
    }
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };


  const sessionEventHandlersSession = {
    streamCreated: event => {
      const streamProperties = {...streamProperties, [event.streamId]: {
        subscribeToAudio: false,
        subscribeToVideo: true,
        style: {
          width: 400,
          height: 300,
        },
      }};
      setStreamProperties({ streamProperties });
    },
  };


  const rtcProps = {
    appId: '47bc36b988eb44a69a36c671863beaf6',
    channel: 'test',
    enableVideo:false,
    mode:1,
    role:2,
    enableAudio:false,
    activeSpeaker:false,
    
  };

  const callbacks = {
    EndCall: () => { 
    },
   }; 

   const styleProps={
    UIKitContainer:{
         borderWidth:1,
       // borderColor:'red',
         marginTop:'15%',
         height: '80%', 
         width: '100%'
    },
    localBtnContainer:{
      display:"none"
      }
   }

   
   
  const subscriberProperties = {
    subscribeToAudio: false,
    subscribeToVideo: true,
  };

  

  const subscriberEventHandlers = {
    connected(event) {
      console.log('connected', event);
    },
    disconnected(event) {
      console.log('disconnected', event);
    },
    videoDataReceived(event) {
      console.log('videoDataReceived', event);
    },
    videoEnabled(event) {
      console.log('\n\n\n*****####videoEnabled', event);
    },
    videoNetworkStats(event) {
      console.log('videoNetworkStats', event);
    },
    otrnError(err){
      console.log('\n\n\n*****####otrnError', err);
    },
    error(err){
      console.log('\n\n\n*****####error', err);

    }
    
    
  };

  

  const onSwipeDown = () => {
    if (!isModelOpen) {
      props.onClose();
    } else {
      setModel(false);
    }
  };

  const onSwipeUp = () => {
    if (!isModelOpen && isReadMore) {
      setModel(true);
    }
  };

  return (
     <View
      onSwipeDown={onSwipeDown}
      onSwipeUp={onSwipeUp}
      config={config}
      style={styles.container}
    >
  <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      > 
        

        {
             dataStories.is_live_stream ?
            <View style={[styles.topHeaderDiv,{padding:0}]}>

                <View style={styles.flex2View}>
                <TouchableOpacity  onPress={props.onClose}>
                <Image source={require('./imgs/cancel-icon-2.png')} 
                  style={styles.cancelbtn}
                  />
                </TouchableOpacity>
                
                </View>
              
                <View style={[styles.flex2View,{flexDirection:'row', 
                alignItems:'center',
                alignSelf:'center',
                justifyContent:'center',
                backgroundColor:'rgba(0, 0, 0, 0.4)', 
                borderRadius:5,
                padding:5
            
              }]}>   
                <Image source={require('./imgs/eyes.png')} 
                  style={styles.eyeiconbtn}
                  />
                <Text style={styles.colorCounter}> 1</Text>
                </View>

                <View style={[styles.flex2View,{flexDirection:'row', 
                alignContent:'flex-end',
                alignItems:'flex-end'
              }]}>
              
              
                </View> 


           </View>
           :<></>
            }

        { 
    messages && messages.map( (item, index)=>{
      return(    
        <View key={index} style={styles.chatBoxContainer}>

         <View style={styles.userImageContainer}>
        <Image source={{uri:item.avatar}} style={styles.userimage} />
        </View>
          
         <View style={styles.chatCommentContainer}>
         <View style={styles.chatCommentWidth}>
         <Text style={styles.chatcomment}>{item.message}</Text>
         </View>
         </View>
         </View>  
           )
          })

          }
          
     
 
      {
            dataStories.is_live_stream ? 
            <View  style={[styles.commentBox]}>
 
               <View  style={styles.commentBoxContainer}>  
                  <TextInput placeholder="Commentss..." 
                  placeholderTextColor={'white'} 
                  onChangeText={(text) => { setCommentText(text) }}
                  value={commentText}
                  style={styles.textbox}/> 
                </View>
                <TouchableOpacity
                onPress={() => {  sendSignalAgora() }}>
                <Image source={require("./imgs/send-arrow-green.png")} />
                </TouchableOpacity>
                  
            </View>
      :
      <></>  
      }
    
      <TouchableOpacity
        activeOpacity={1}
        delayLongPress={500}
        onPress={(e) => changeStory(e.nativeEvent)}
        onLongPress={() => onPause(true)}
        onPressOut={() => onPause(false)}
        style={styles.container}
      >
        <View style={styles.container}>
          
          {
            dataStories.is_live_stream ? 
         <View>
            
        <View style={{ 
        flex: 1, 
        flexDirection: 'column', 
        paddingHorizontal: 10, 
        width:500,
        paddingVertical: 10 }}>
       {/* <OTSession 
             apiKey={"46711382"} 
             sessionId={"2_MX40NjcxMTM4Mn5-MTYzNzA3MzA4OTU0Mn5waHF3dytnMHlHQ2tNUS8vZVZOWGpmMHV-fg"} 
             token={"T1==cGFydG5lcl9pZD00NjcxMTM4MiZzaWc9NGI3ZDM1Y2FiODY2YzZjMGZkNDQ2ZjNjZDc3NWRjOTkxODgxY2Y1NjpzZXNzaW9uX2lkPTJfTVg0ME5qY3hNVE00TW41LU1UWXpOekEzTXpBNE9UVTBNbjV3YUhGM2R5dG5NSGxIUTJ0TlVTOHZaVlpPV0dwbU1IVi1mZyZjcmVhdGVfdGltZT0xNjM3MDczMTUyJm5vbmNlPTAuODQ5OTE1OTgxNTk5MDU1MyZyb2xlPXN1YnNjcmliZXImZXhwaXJlX3RpbWU9MTYzOTY2NTE1MSZjb25uZWN0aW9uX2RhdGE9U3Vic2NyaWJlciZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="}
             ref={sessionRef}
             eventHandlers={sessionEventHandlersSession}>

               
          <OTSubscriber style={{ width: 500,  borderColor:'red', 
          borderWidth:2,  height: "100%" }} 
          properties={subscriberProperties}
          eventHandlers={subscriberEventHandlers}
          streamProperties={streamProperties}
          
           />
         </OTSession> */}

            <AgoraUIKit rtcProps={rtcProps} 
                      callbacks={callbacks} 
                      styleProps={styleProps}
                    
                      />
         </View>

        
            
          {/*
          
          OTSession -   eventHandlers={sessionEventHandlers}
          properties={subscriberProperties}
          eventHandlers={subscriberEventHandlers}

          <NodePlayerView 
              style={{height: '70%', width:500, 
              resizeMode:'contain',
              marginTop:'30%', 
              borderWidth:2 }}
              inputUrl={dataStories.live_stream_details.downstreamUrl}
              bufferTime={300}
              maxBufferTime={1000}
              autoplay={false}
               />  */}
               {/* <Text style={{color:'#fff', fontSize:8}}>
                {dataStories.live_stream_details.downstreamUrl}
              </Text>
              <ActivityIndicator color="white" /> */}
            

            </View>
            :
            <View> 
          
             <Story
            onImageLoaded={onImageLoaded}
            pause={isPause}
            isNewStory={props.isNewStory}
            onVideoLoaded={onVideoLoaded}
            story={story}
          />  
          
          {loading()}
          
          <UserView
            name={dataStories.is_live_stream?dataStories.username+ " is Live" : dataStories.username}
            profile={dataStories.profile}
            datePublication={stories && stories[currentIndex].created}
            onClosePress={props.onClose}
          />

          </View>
          }
           
          
            

          

          <ProgressArray
            next={nextStory}
            isLoaded={isLoaded}
            duration={duration}
            pause={isPause}
            isNewStory={props.isNewStory}
            stories={stories}
            currentIndex={currentIndex}
            currentStory={stories[currentIndex]}
            length={stories.map((_, i) => i)}
            progress={{ id: currentIndex }}
          />
        </View>

        <Modal
          style={styles.modal}
          position="bottom"
          isOpen={isModelOpen}
          onClosed={onReadMoreClose}
        >
          <View style={styles.bar} />
         </Modal>
      </TouchableOpacity>

   
        
      </KeyboardAvoidingView>
    </View>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    // paddingTop: 30,
  },
  item: {
    padding: 10,
    fontSize: 18,
    color:'#fff',
    height: 44,
  },
  colorCounter:{
  color:"#fff" 
  },
  flexrowx:{
   flexDirection:'row',
   width:'100%'
  },
  topHeaderDiv:{
    flexDirection: "row",
   // position: "absolute",
   // backgroundColor:"rgba(30,30,30,0.35)",
    top: "10%",
    zIndex:3,
 
    width: "90%",
    //alignItems: "center",
  },
  commentext:{
    color:'#fff' 
  },
  commentBox:{
   position: 'absolute',
   zIndex:2,
   top:'85%',
   marginLeft:'0%',
  // backgroundColor:'rgba(28, 28, 28, 0.4)',
   width:'100%',
   flexDirection:'row',
   height:70,
   borderRadius:20,
   padding:11
  },
  commentBoxContainer:{
    flex:5,
    marginRight:'4%',
     height:100
    },

  textbox:{
    width:'100%',
    backgroundColor:"#fff",
 //   backgroundColor:'rgba(10,10,10,0.7)',
    color:'#000',
    padding:10,
    height:40,
    marginRight:'4%',
    borderRadius:20,
  },
  cancelbtn:{
    height:35,
    width:35,
    resizeMode:'contain'
  },
  eyeiconbtn:{
    height:20,
    width:20,
    resizeMode:'contain'
  },
  flex2View:{
    flex:2
  },
  progressBarArray: {
    flexDirection: "row",
    position: "absolute",
    top: 30,
    width: "98%",
    height: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  userView: {
    flexDirection: "row",
    position: "absolute",
    top: 55,
    width: "98%",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 12,
    color: "white",
  },
  time: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 3,
    marginLeft: 12,
    color: "white",
  },
  content: { width: "100%", height: "100%" },
  loading: {
    backgroundColor: "black",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "100%",
    height: "90%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bar: {
    width: 50,
    height: 8,
    backgroundColor: "gray",
    alignSelf: "center",
    borderRadius: 4,
    marginTop: 8,
  },


  /****   CHATBOX RELATED  */
  chatBoxContainer: {
   // position:'absolute',
    top:'90%',
    left:'0%',
    marginTop:'3.5%',
    //marginTop:'4%',
    flexDirection:'row',
 //   height:100,
    width:"90%",
    zIndex: 3
},
userimage:{
   width:36,  
   height:36,
   alignSelf:'center',
   borderRadius:50
   
} ,
chatcomment:{
   color:"#fff",
   width:'80%',

},
userImageContainer:{
   flex:0.9,
   textAlign:'center',
   alignContent:"center",
   justifyContent:'center'
},
chatCommentContainer:{
   flex:3,
},
chatCommentWidth:{
   backgroundColor: "rgba(28, 28, 28, 0.2)",
   width:'85%',
   borderRadius:10,
   padding:3,
   paddingLeft:2,
   justifyContent:'center',
   textAlign:'center'
}

});

export default StoryContainer;
