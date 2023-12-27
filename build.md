# Android
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

# iOS
TODO
 