# Android
### 0.
First try cleaning and rebuilding to see if that fixes errors
```sh
cd android
./gradlew clean
./gradlew build
```

### 1. 
Make sure to add app variants to `android/app/build.gradle` if starting from scratch
```java
android {
    ...
    // project.ext.sentryCli = [ flavorAware: true ]
    flavorDimensions "env"
    productFlavors {
        production {
            dimension "env"
            applicationId 'com.jinnihealth'
        }
        staging {
            dimension "env"
            applicationId 'com.jinnihealth.staging'
        }
        development {
            dimension "env"
            applicationId 'com.jinnihealth.development'
        }
    }
}
```



### 2.
Follow instructions for adding Health Connect to the app. May have been updated since these docs were written but orignally we used

in `MainActivity.java` update `onCreate`
```java
import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate

override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState) // replace
  // In order to handle permission contract results, we need to set the permission delegate.
  HealthConnectPermissionDelegate.setPermissionDelegate(this) // add
}
```


# iOS
TODO
 