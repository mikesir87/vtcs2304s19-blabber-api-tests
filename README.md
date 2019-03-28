# Blabber API Tests

Provides a test image that can test a Blabber API

## Configuration

- `SERVICE_NAME` - the name of the service, which translates to the hostname that requests should be sent to
- `API_PORT` - the port requests should be sent to (default: 80)

## Example Compose File

```yaml
version: "3.7"

services:
  api:
    image: blabber-api

  tests:
    image: vtcs2304s19/blabber-api-tests
    environment:
      SERVICE_NAME: api
      API_PORT: "3000" 
```
