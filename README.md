### App Deployments
Android
[![PWA Status](https://api.netlify.com/api/v1/badges/b8063611-c1d8-4945-b887-788c1294d644/deploy-status)](https://app.netlify.com/sites/jinnihealth/deploys)


## TODO
### 1. modularize testing suite
1. add to package.json
```
    "projects": [
      {
        "preset": "jest-expo/ios"
      },
      {
        "preset": "jest-expo/android"
      },
      {
        "preset": "jest-expo/web"
      }
    ],
```
2. split out test files into .android.js, .ios.js, and .web.js
