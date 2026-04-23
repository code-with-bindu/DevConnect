import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestReducer from "./requestSlice";
import notificationReducer from "./notificationSlice";
import activeConversationReducer from "./activeConversationSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    feed: feedReducer,
    connections: connectionReducer,
    requests: requestReducer,
    notification: notificationReducer,
    activeConversation: activeConversationReducer,
  },
});

export default appStore;
