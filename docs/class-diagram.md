# Traditional UML Class Diagram - AI Chatbot Integration Platform

Scope: traditional enterprise-style UML class diagram for the backend domain and application layer.  
Source of truth: current code in `BE/src/models`, `BE/src/services`, and `BE/src/controllers`.

Artifacts:

- Mermaid source in this file
- Rendered SVG: `docs/class-diagram.svg`
- Editable draw.io source: `docs/class-diagram.drawio`

## Diagram

```mermaid
classDiagram
direction LR

class User {
  <<Entity>>
  -ObjectId _id
  -String userName
  -String password
  -UserRole role
  -String businessId
  -String businessName
  -String email
  -String phone
  -AccountStatus status
  -String createdBy
  -String updatedBy
  -Date createdAt
  -Date updatedAt
}

class BusinessConfig {
  <<Entity>>
  -ObjectId _id
  -String businessId
  -String businessName
  -String industry
  -String email
  -String phone
  -String website
  -BusinessTone tone
  -String description
  -String language
  -UIFlowNode[] uiFlowTree
  -String chatbotName
  -String welcomeMessage
  -Boolean isActive
  -Map metadata
  -Date createdAt
  -Date updatedAt
}

class UIFlowNode {
  <<Embedded>>
  -String id
  -String name
  -String label
  -String parentId
  -String description
  -ActionType actionType
  -String url
  -String path
  -String action
  -UIFlowNode[] children
}

class ChatSession {
  <<Entity>>
  -ObjectId _id
  -String sessionId
  -String businessId
  -ChatMessage[] messages
  -Date lastActivityAt
  -String userAgent
  -String ipAddress
  -Date createdAt
  -Date updatedAt
  +preSave() void
}

class ChatMessage {
  <<Embedded>>
  -ObjectId _id
  -MessageRole role
  -String content
  -AISuggestion suggestion
  -Date timestamp
}

class AISuggestion {
  <<ValueObject>>
  -SuggestionType type
  -String target
}

class ApprovalRequest {
  <<Entity>>
  -ObjectId _id
  -String requestId
  -ObjectId targetId
  -TargetType targetType
  -RequestAction action
  -Mixed payload
  -RequestStatus status
  -String createdBy
  -String updatedBy
  -Date createdAt
  -Date updatedAt
}

class BusinessConfigService {
  <<Service>>
  +upsertConfig(data) BusinessConfig
  +getConfig(businessId) BusinessConfig
  +listConfigs(page, limit) PageResult
  +updateUIFlowTree(businessId, uiFlowTree) BusinessConfig
  +updateDescription(businessId, description) BusinessConfig
  +deleteConfig(businessId) BusinessConfig
}

class ChatSessionService {
  <<Service>>
  +getOrCreateSession(sessionId, businessId, meta) ChatSession
  +appendMessage(sessionId, message) ChatSession
  +getHistory(sessionId, limit) ChatMessage[]
  +generateSessionId() String
}

class AIService {
  <<Service>>
  -GoogleGenAI ai
  -String model
  -Object generationConfig
  -formatUIFlowTree(nodes, depth) String
  -buildSystemPrompt(config) String
  -buildHistory(messages) Object[]
  -parseResponse(rawText) AIResponse
  +generateResponse(params) AIResponse
}

class AuthController {
  <<Controller>>
  +login(req, res) Response
  +seedSystemAdmin(req, res) Response
  +getCurrentUser(req, res) Response
  +changePassword(req, res) Response
}

class UserManagementController {
  <<Controller>>
  +getDashboardStats(req, res) Response
  +getBusinesses(req, res) Response
  +getAdmins(req, res) Response
  +requestUpdateUser(req, res) Response
  +registerBusiness(req, res) Response
  +createAdminRequest(req, res) Response
  +getApprovalRequests(req, res) Response
  +handleRequest(req, res) Response
}

class AdminController {
  <<Controller>>
  +upsertConfig(req, res) Response
  +listConfigs(req, res) Response
  +getConfig(req, res) Response
  +updateDescription(req, res) Response
  +updateUIFlowTree(req, res) Response
  +deleteConfig(req, res) Response
  +updateBusinessInfo(req, res) Response
}

class ConfigController {
  <<Controller>>
  +loadPublicConfig(req, res) Response
}

class ChatController {
  <<Controller>>
  +sendMessage(req, res) Response
  +getHistory(req, res) Response
  +clearSession(req, res) Response
}

class UserRole {
  <<Enumeration>>
  ADMIN_SYSTEM
  ADMIN
  BUSINESS
}

class AccountStatus {
  <<Enumeration>>
  Active
  Inactive
}

class BusinessTone {
  <<Enumeration>>
  professional
  friendly
  casual
  formal
  neutral
}

class ActionType {
  <<Enumeration>>
  navigate
  action
  info
}

class MessageRole {
  <<Enumeration>>
  user
  assistant
}

class SuggestionType {
  <<Enumeration>>
  navigate
  action
}

class TargetType {
  <<Enumeration>>
  ADMIN
  BUSINESS
}

class RequestAction {
  <<Enumeration>>
  CREATE
  UPDATE
  DELETE
}

class RequestStatus {
  <<Enumeration>>
  Pending
  Approved
  Rejected
}

class AIResponse {
  <<DTO>>
  -String message
  -AISuggestion suggestion
}

User --> UserRole : role
User --> AccountStatus : status
BusinessConfig --> BusinessTone : tone
UIFlowNode --> ActionType : actionType
ChatMessage --> MessageRole : role
AISuggestion --> SuggestionType : type
ApprovalRequest --> TargetType : targetType
ApprovalRequest --> RequestAction : action
ApprovalRequest --> RequestStatus : status
AIResponse *-- AISuggestion : suggestion

User "0..1" --> "0..1" BusinessConfig : businessId
BusinessConfig "1" *-- "0..*" UIFlowNode : uiFlowTree
UIFlowNode "0..1" o-- "0..*" UIFlowNode : children
BusinessConfig "1" --> "0..*" ChatSession : businessId
ChatSession "1" *-- "0..*" ChatMessage : messages
ChatMessage "0..1" *-- "0..1" AISuggestion : suggestion
ApprovalRequest "*" --> "1" User : targetId

BusinessConfigService ..> BusinessConfig : repository access
ChatSessionService ..> ChatSession : repository access
AIService ..> BusinessConfig : prompt context
AIService ..> ChatMessage : conversation context
AIService ..> AIResponse : creates

AuthController ..> User : authenticate/update
UserManagementController ..> User : manage accounts
UserManagementController ..> ApprovalRequest : maker-checker
UserManagementController ..> BusinessConfig : dashboard stats
AdminController ..> BusinessConfigService : delegates
ConfigController ..> BusinessConfigService : delegates
ChatController ..> BusinessConfigService : load config
ChatController ..> ChatSessionService : manage session
ChatController ..> AIService : generate answer
```

## Design Notes

- This is a UML class diagram, not a frontend component diagram.
- Mongoose models are represented as `<<Entity>>`.
- Nested schemas are represented as `<<Embedded>>`.
- `AISuggestion` and `AIResponse` are value/DTO-style classes used by chat flow.
- Services and controllers are included to show application-layer methods and dependencies.
- React hooks/components and API clients are intentionally excluded from this diagram because they belong in component/sequence diagrams, not the core UML class diagram.

## Verification Notes

- Entity fields were verified against `BE/src/models/User.js`, `BusinessConfig.js`, `ChatSession.js`, and `ApprovalRequest.js`.
- Service methods were verified against `BE/src/services/businessConfigService.js`, `chatSessionService.js`, and `aiService.js`.
- Controller methods were verified against `BE/src/controllers/authController.js`, `adminController.js`, `chatController.js`, `configController.js`, and `userManagementController.js`.
- `ChatSession` stores `messages`, not `history`.
- `BusinessConfig.tone` follows the backend enum: `professional`, `friendly`, `casual`, `formal`, `neutral`.
