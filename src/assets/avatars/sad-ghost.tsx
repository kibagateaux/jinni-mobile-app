import * as React from "react"
import Svg, {
  SvgProps,
  Path,
  Defs,
  Pattern,
  Use,
  Image,
} from "react-native-svg"
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={225}
    height={226}
    fill="none"
    {...props}
  >
    <Path fill="url(#a)" d="M0 .5h225v225H0z" />
    <Defs>
      <Pattern
        id="a"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <Use xlinkHref="#b" transform="scale(.00444)" />
      </Pattern>
      <Image
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA21BMVEUhIf/////6ubAAAAAcHNjb29wbHf8aGs8iIif/yqUmJff4t7EAAP8jI/7lrbT8vK4AD/8gIO3JnMWxicv+watFNvTwuLAAADri4uK7u7v39/g9PTN1WeimfNkPD6iqqqsyK/oAABsLC5oAACqUlJEAAGsAAGR1XeH/xqfVp7rHx8ZLS0Rubm4VFcEuLhj/vawPDw4AAFiCgoAcHBgMDHMiIugAADNZRu//z6ANDWKtiNSpgdfKn8S2k8lgUenMqMDru6tsW+H/2ptNOvIXF7YLC488PDwGBhUAAA1+y/m1AAAEP0lEQVR4nO3da3PSQBTG8ZRQaCHLxSq3qkCDghcsValYq8VLa7//JxJnfNFzrOdk3WB26/N/G85mfzplprMxRjv5Noldm+S8oyjn9SYnZbdOvBc+MZFL5on/QidgFEFoHYS2QQghhPZBaBuEEEJon61wsCv32ln4WrnDYMvC/mJP7M1bR+HbN/INFv1tC9N5VazsKCzLy8/TrQu7bUeCW+0uhBBCCCGEEEIIIYQQ3klhjzYsXDhkO3IV9vjxXlqwMOUb0oi6cFmjFQqMIrabZQ7CoklyNQghhLDwIIQQwuKDEEIIi89eOOjTht4Lh2zH/HyRC3cXp11S6rkwpds9Xexqwr15m1a0QYntdr6nC6tF79mpKoQQeh+EEPofhBD6H4QQ+h+EEPofhBD6H4QQ+h+EEPofhBD6H4R/I6wobXf8HwjN9KHYO3mPlXfy+NTyVSn5Cyu1VfNYaHaQiPPJwUwab65qdn+L2xDu10tC91XhfWm8vg8hhBBCCCGEEEII4X8p7AUv5M+bRi9Zi8CFCw6K4pOnpPfLoIXL95RzEkdx2dCsFvROGDFN+afQbgWWd0IWhHoQQgghhFoQ6kEIIYQQauUh9OvsiZeD0Jw9kvowbYnzrekHcf7MFC3c7FFOPQNW5h13l4fQ7yAMPwjDD8LwgzD8IAw/CMMPwvCDMPwgDD8Iww/C8IMw/CAMPwjDL4tQORvSDoe0syXtbMrx9hmErXti5x8T8XnNyqcLcf7ik0g0ycdzeQMKMYtQPMQuNRuysDWdifMz+QTVJI2mOF/PQdhxFUp/RHVXYQdCCCGEEEIIIYQQwjsqZP80qtWpS5U2QqmfQqmNUJxPGiVxvsPHMwgT1r7Yas0/z/r8RZz/8lmZX6/kDfDPq0JTOW/QRjUps1w3pDpnLXG+ddYR59dLI86P2OfPK0YVPmuSjkfyO4DMqtQUmh0k4nhyMJPGSysj3350TAeeZRLSr5LR7T/Cvyr6Oe8R2y2EEEIIIYQQQgghhHdGSO8RlrCURXjRIa1VYUdqrQrX4rwqZOMXqjCqPGCJN9j0lQ/QRsr7S0fy+Fft9nyA3Q6n3OEHYfhBGH4Qhh+E4Qdh+EHoX2bOUj6fRcjPs2y31BZPx9qW79psn74ifVfmMwhNTEvt/jt5cxTLHdkR293+zRfMPh/nIBz3ezcadi2Fjw97UoePPRA+v7lk31442PlzAwh5EPIgjCBUgxBCHoQ8CCMI1dyF9NnK2m9C+6cveQULj1hjKozZZb7cbcJylXZNhemcXd+u0MSHL0hXVHhFrx6mNfX8sNbdo8VUuGCXr5UdOguHOwMSW4BeG6bsN/TbhOlkl0bWHNBrvUm8faFF2YR2S0LondAEL9S/aUIX0nkIIQxRiG8a/4V0HkIIIfRD+K1Mqo4thcuy2KUivJTHl5bCcZXOf9sIf8tSqHUlCq/Uedft/ACydJQIuE0fXAAAAABJRU5ErkJggg=="
        id="b"
        width={225}
        height={225}
      />
    </Defs>
  </Svg>
)
export default SvgComponent
