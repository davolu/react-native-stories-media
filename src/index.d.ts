export type user = {
  username: string;
  profile: string;
};

export type StoryType = {
  id?: number;
  url?: string;
  type?: string | 'image' | 'video' | 'text';
  duration?: number;
  isReadMore?: boolean;
  isSeen?: boolean;
  isPaused?: boolean;
  url_readmore?: string;
  created?: string;
  storyid?: number;
  title?: string;
};

export type liveStreamDetailsType = {
  _id?: number;
  downstreamUrl?: string;
 
};

export type StoriesType = {
  username?: string;
  profile?: string;
  isOnLiveStream?: string;
  title?: string;
  storyid?: number;
  stories?: Array<StoryType>;
  liveStreamDetails?: Array<liveStreamDetailsType>;

};
