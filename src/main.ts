import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./styles.css";

window.CESIUM_BASE_URL = "/cesium/";

createApp(App).use(createPinia()).mount("#app");
