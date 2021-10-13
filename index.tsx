import React, { useRef, useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StoryType } from "./src";

const { CubeNavigationHorizontal } = require("react-native-3dcube-navigation");
import {
  widthPercentageToDP as wp2dp,
  heightPercentageToDP as hp2dp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import StoryContainer from "./src/StoryContainer";

type Props = {
  data: StoryType[];
  containerAvatarStyle?: StyleSheet.Styles;
  avatarStyle?: StyleSheet.Styles;
  titleStyle?: StyleSheet.Styles;
  textReadMore?: string;
};

const Stories = (props: Props) => {
  const [isModelOpen, setModel] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentScrollValue, setCurrentScrollValue] = useState(0);
  const modalScroll = useRef(null);

  const baseWidth = 375;
  const baseHeight = 811;

  const wp = wp2dp((72 / baseWidth) * 100 + '%');
  const hp = hp2dp((119 / baseHeight) * 100 + '%');

  const onStorySelect = (index) => {
    setCurrentUserIndex(index);
    setModel(true);
  };

  const onStoryClose = () => {
    setModel(false);
  };

  const onStoryNext = (isScroll: boolean) => {
    const newIndex = currentUserIndex + 1;
    if (props.data.length - 1 > currentUserIndex) {
      setCurrentUserIndex(newIndex);
      if (!isScroll) {
        //erro aqui
        try {
          modalScroll.current.scrollTo(newIndex, true);
        } catch (e) {
          console.warn("error=>", e);
        }
      }
    } else {
      setModel(false);
    }
  };

  const onStoryPrevious = (isScroll: boolean) => {
    const newIndex = currentUserIndex - 1;
    if (currentUserIndex > 0) {
      setCurrentUserIndex(newIndex);
      if (!isScroll) {
        modalScroll.current.scrollTo(newIndex, true);
      }
    }
  };

  const onScrollChange = (scrollValue) => {
    if (currentScrollValue > scrollValue) {
      onStoryNext(true);
      console.log("next");
      setCurrentScrollValue(scrollValue);
    }
    if (currentScrollValue < scrollValue) {
      onStoryPrevious(false);
      console.log("previous");
      setCurrentScrollValue(scrollValue);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={props.data}
        horizontal
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => (
          <View style={styles.boxStory}>
            <TouchableOpacity onPress={() => onStorySelect(index)}>
              <View style={[styles.superCircle, props.containerAvatarStyle]}>
            { item.is_live_stream ?
              <View style={styles.videoIconContainer}>
                 <Icon name="videocam" color="white" />
               </View>
               :
               <></>
             } 
                <Image
                  style={[styles.circle, props.avatarStyle,{
                    width:wp,
                    height:hp
                  }]}
                  source={{ uri: item.profile }}
                />
              </View>
              
              <Text style={[styles.title, props.titleStyle]}>{item.username}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      <Modal
        animationType="slide"
        transparent={false}
        visible={isModelOpen}
        style={styles.modal}
        onShow={() => {
          if (currentUserIndex > 0) {
            modalScroll.current.scrollTo(currentUserIndex, false);
          }
        }}
        onRequestClose={onStoryClose}
      >
        <CubeNavigationHorizontal
          callBackAfterSwipe={(g) => onScrollChange(g)}
          ref={modalScroll}
          style={styles.container}
        >
          {props.data.map((item, index) => (
            <StoryContainer
              key={item.title}
              onClose={onStoryClose}
              onStoryNext={onStoryNext}
              onStoryPrevious={onStoryPrevious}
              dataStories={item}
              isNewStory={index !== currentUserIndex}
              textReadMore={props.textReadMore}
            />
          ))}
        </CubeNavigationHorizontal>
      </Modal>
    </View>
  );
};

const styles = new StyleSheet.create({
  boxStory: {
    marginLeft: 0,
  },
  ItemSeparator: { height: 1, backgroundColor: "#ccc" },
  container: {
    //flex: 1,
    //backgroundColor: "red",
    //paddingBottom: 5,
  },
  circle: {
    width: 80,
    height: 120,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: "#000",
  },
  superCircle: {
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 60,
  },
  modal: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color:'#fff',
    textAlign: "center",
  },
 
  videoIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1FCC79",
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: 3,
    zIndex:2,
    top: 3,
   
  },
  
});

export default Stories;
