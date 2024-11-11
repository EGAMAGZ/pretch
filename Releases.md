### 2024.11.11

#### @pretch/core 0.5.2 (minor)

- docs(core): Improved jsdoc for buildFetch function
- style(core): Formatted project
- style(core): Formatted files
- style(core): Added return type in function that misses it and formatted code
- refactor(core): Turned jwt middleware to authorization middleware to support
  different authorizations schemes
- refactor(core): Renamed middlewares to remove unnecessary "middleware" name
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- refactor(core): Refactored code to follow deno style guide and added feature
  to dump body on invalid status (before throwing exception)
- refactor(core): Distributed test through different files and renamed existing
  ones to follo the deno naming conventions
- refactor(core): Validate delay and max number of retries in
- refactor(core): Updated export path of build fetch function
- refactor(core): Renamed function from apply-middleware to apply-middlewares
- refactor(core): Removed useless "retry" function
- test(core): Tested maxRetries and delay validation
- test(core): Improved tests
- test(core): Developed test for buildFetch with middlewares applied
- test(core): Changed tests description to be more understandable
- test(core): Usage of stub in build fetch's tests
- test(core): Modified test data to not depend on external api's for testing and
  get more control
- test(core): Created and passed test for RetryMiddleware
- test(core): Created and passed test for ValidateStatusMiddleware

#### @pretch/preact 0.1.4 (patch)

- docs(preact): Improved JSDoc for useFetch hook
- refactor(preact): Created useLazyFetch hook
- refactor(preact): Renamed file into use_fetch.ts
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- chore(preact): Fixed typo in workspace name

#### @pretch/react 0.0.3 (patch)

- feat(react): Created same hooks from preact version

### 2024.11.11

#### @pretch/core 0.5.2 (minor)

- docs(core): Improved jsdoc for buildFetch function
- style(core): Formatted project
- style(core): Formatted files
- style(core): Added return type in function that misses it and formatted code
- refactor(core): Turned jwt middleware to authorization middleware to support
  different authorizations schemes
- refactor(core): Renamed middlewares to remove unnecessary "middleware" name
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- refactor(core): Refactored code to follow deno style guide and added feature
  to dump body on invalid status (before throwing exception)
- refactor(core): Distributed test through different files and renamed existing
  ones to follo the deno naming conventions
- refactor(core): Validate delay and max number of retries in
- refactor(core): Updated export path of build fetch function
- refactor(core): Renamed function from apply-middleware to apply-middlewares
- refactor(core): Removed useless "retry" function
- test(core): Tested maxRetries and delay validation
- test(core): Improved tests
- test(core): Developed test for buildFetch with middlewares applied
- test(core): Changed tests description to be more understandable
- test(core): Usage of stub in build fetch's tests
- test(core): Modified test data to not depend on external api's for testing and
  get more control
- test(core): Created and passed test for RetryMiddleware
- test(core): Created and passed test for ValidateStatusMiddleware

#### @pretch/preact 0.1.4 (patch)

- docs(preact): Improved JSDoc for useFetch hook
- refactor(preact): Created useLazyFetch hook
- refactor(preact): Renamed file into use_fetch.ts
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- chore(preact): Fixed typo in workspace name

#### @pretch/react 0.0.3 (patch)

- feat(react): Created same hooks from preact version

### 2024.11.03

#### @pretch/core 0.5.2 (patch)

- chore(*): Added license to each workspace

#### @pretch/preact 0.1.4 (patch)

- chore(*): Added license to each workspace

#### @pretch/react 0.0.3 (patch)

- chore(*): Added license to each workspace

### 2024.11.03

#### @pretch/core 0.5.1 (minor)

- docs(core): Improved jsdoc for buildFetch function
- style(core): Formatted project
- style(core): Formatted files
- style(core): Added return type in function that misses it and formatted code
- refactor(core): Turned jwt middleware to authorization middleware to support
  different authorizations schemes
- refactor(core): Renamed middlewares to remove unnecessary "middleware" name
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- refactor(core): Refactored code to follow deno style guide and added feature
  to dump body on invalid status (before throwing exception)
- refactor(core): Distributed test through different files and renamed existing
  ones to follo the deno naming conventions
- refactor(core): Validate delay and max number of retries in
- refactor(core): Updated export path of build fetch function
- refactor(core): Renamed function from apply-middleware to apply-middlewares
- refactor(core): Removed useless "retry" function
- test(core): Tested maxRetries and delay validation
- test(core): Improved tests
- test(core): Developed test for buildFetch with middlewares applied
- test(core): Changed tests description to be more understandable
- test(core): Usage of stub in build fetch's tests
- test(core): Modified test data to not depend on external api's for testing and
  get more control
- test(core): Created and passed test for RetryMiddleware
- test(core): Created and passed test for ValidateStatusMiddleware

#### @pretch/preact 0.1.3 (patch)

- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- chore(preact): Fixed typo in workspace name

#### @pretch/react 0.0.2 (patch)

- style(*): Formatted project
- chore(*): Moved compilerOptions to root deno.json
