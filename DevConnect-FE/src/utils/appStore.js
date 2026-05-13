import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestReducer from "./requestSlice";
import notificationReducer from "./notificationSlice";
import activeConversationReducer from "./activeConversationSlice";
import presenceReducer from "./presenceSlice";
import toastReducer from "./toastSlice";
import darkReducer from "./darkSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    feed: feedReducer,
    connections: connectionReducer,
    requests: requestReducer,
    notification: notificationReducer,
    activeConversation: activeConversationReducer,
    presence: presenceReducer,
    toast: toastReducer,
    dark: darkReducer,
  },
});

export default appStore;
