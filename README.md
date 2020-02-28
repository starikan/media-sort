Usage:

`node index.js ROOT='' EXPORT_PATH='' ALLOW_IMAGES='' ALLOW_VIDEOS=''`

Parameter | Description | Default Value | Type
------------- | ------------- | ------------- | -------------
ROOT | Root folder of tests | `process.cwd()` | `String`
EXPORT_PATH | Append folders of tests and stuff | `export` | `String`
ALLOW_IMAGES | Ignore folders of tests starts with | `.jpg,.jpeg` | `String`
ALLOW_VIDEOS | Links of environments to run. | `.mp4,.MTS,.3gp` | `String`