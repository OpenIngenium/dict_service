# Dictionary Service

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/badge/node.js-20+-brightgreen.svg)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/fastify-5.4+-blue.svg)](https://www.fastify.io/)
[![ArangoDB](https://img.shields.io/badge/arangodb-3.8+-orange.svg)](https://www.arangodb.com/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)




A REST API service for managing aerospace project dictionaries, telemetry channels, commands, EVRs (Event Records), and verification scripts. Built with Fastify and ArangoDB.

## Features

- **Dictionary Management**: Create, read, update, and delete dictionary versions for flight and ground support equipment (SSE)
- **Command Definitions**: Manage spacecraft commands with arguments, validation rules, and metadata
- **Telemetry Channels**: Handle telemetry channel definitions with data types and engineering units
- **Event Records (EVRs)**: Manage event record definitions with severity levels and messages
- **MIL-1553 Variables**: Support for MIL-STD-1553 bus communication variables
- **Verification & Validation**: Track verification items and their associated activities
- **Custom Scripts**: Define and manage custom verification scripts with inputs, outputs, and layouts
- **Bulk Operations**: Efficient bulk create, query, and delete operations
- **Advanced Search**: Wildcard search, pagination, and filtering capabilities
- **JWT Authentication**: Secure API endpoints with JSON Web Token authentication
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## Technology Stack

- **Backend**: Node.js with Fastify framework
- **Database**: ArangoDB (NoSQL document database)
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI
- **Container**: Docker
- **Testing**: Python-based integration tests

## Prerequisites

- **Node.js** 20 or higher
- **npm** or **yarn**
- **ArangoDB** 3.8 or higher
- **Docker** (optional, for containerized deployment)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/OpenIngenium/dict_service.git 
cd dict-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Application Configuration
APP_PORT=5000
APP_HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# ArangoDB Configuration
ARANGO_URL=http://localhost:8529
ARANGO_DB_NAME=project_config
ARANGO_USERNAME=root
ARANGO_PASSWORD=your_password # TODO: Replace with your actual ArangoDB password

# JWT Configuration
PUBLIC_PEM=your_jwt_public_key # TODO: Replace with your actual JWT public key
```

### 4. Start ArangoDB

**Option A: Using Docker**
```bash
docker run -p 8529:8529 -e ARANGO_ROOT_PASSWORD=test123 arangodb/arangodb:latest
```

**Option B: Local Installation**
Follow the [ArangoDB installation guide](https://www.arangodb.com/docs/stable/installation.html)

### 5. Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The API will be available at `http://localhost:5000` with Swagger documentation at `http://localhost:5000/api-docs`.

## Docker Deployment

```bash
# Build the image
docker build -t dict-service .

# Run the container
docker run -p 5000:5000 \
  -e ARANGO_URL=http://your-arangodb:8529 \ # TODO: Replace with your ArangoDB URL
  -e ARANGO_USERNAME=root \
  -e ARANGO_PASSWORD=your_password \ # TODO: Replace with your ArangoDB password
  -e PUBLIC_PEM=your_jwt_public_key \ # TODO: Replace with your JWT public key
  dict-service
```

## API Overview

The service provides RESTful endpoints organized by resource type:

### Base URL: `/api/v4`

- **Health Check**: `GET /health` (no authentication required)
- **Dictionaries**: `/dictionaries/{type}/versions/`
  - Commands: `/dictionaries/{type}/versions/{version}/cmds`
  - EVRs: `/dictionaries/{type}/versions/{version}/evrs`
  - Channels: `/dictionaries/{type}/versions/{version}/channels`
  - MIL-1553: `/dictionaries/{type}/versions/{version}/mil1553`
- **Verification & Validation**: `/vnv/vis/`
- **Custom Scripts**: `/custom_scripts/`

### Dictionary Types
- `flight`: Flight software dictionaries
- `sse`: Ground support equipment dictionaries

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
``` 

## Testing

The project includes comprehensive Python-based integration tests that verify API functionality.

### Test Setup

1. **Create a Python virtual environment:**
   ```bash
   python3 -m venv test-env
   source test-env/bin/activate  # On Windows: test-env\Scripts\activate
   ```

2. **Install test dependencies:**
   ```bash
   cd tests/
   pip install -r requirements.txt
   ```

3. **Configure test environment:**
   ```bash
   # Set the service URL (default: http://localhost:5000)
   export DICT_SERVICE_URL=http://localhost:5000

   # Set JWT private key for test token generation
   export PRIVATE_PEM="your_jwt_private_key" # TODO: Replace with your JWT private key
   ```

### Running Tests

All integration tests start with `test_ci_` and can be run directly:

```bash
# Run individual test files
python test_ci_health.py
python test_ci_dictionary.py
python test_ci_dictionarycontent.py
python test_ci_vnv.py
python test_ci_customscript.py

# Or run all tests
python -m unittest discover -s . -p "test_ci_*.py"
```

### Test Coverage

The test suite covers:
- **Health endpoint**: Basic connectivity and response validation
- **Dictionary management**: CRUD operations for dictionary versions
- **Dictionary content**: Commands, EVRs, channels, and MIL-1553 variables
- **Verification & Validation**: V&V item management
- **Custom scripts**: Script definition and management
- **Authentication**: JWT token validation
- **Error handling**: Invalid requests and edge cases

Test reports are generated in XML format in the `test-reports/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Available at `/api-docs` when running the service
- **Issues**: Report bugs and request features via GitHub Issues
- **API Reference**: Complete OpenAPI/Swagger documentation included

