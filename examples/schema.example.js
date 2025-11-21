export default {
  users: {
    id: "uuid:pk",
    name: "text:notnull",
    email: "text:unique:notnull",
    age: "integer:default=18",
    profile: {
      bio: "text",
      avatar_url: "text"
    },
    created_at: "timestamptz:default=now()"
  },
  profiles: {
    id: "uuid:pk",
    user_id: "uuid:fk=users.id",
    visibility: "text:default='public'",
    created_at: "timestamptz:default=now()"
  }
};
