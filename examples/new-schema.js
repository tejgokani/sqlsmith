export default {
  users: {
    id: "uuid:pk",
    name: "text:notnull",
    email: "text:unique:notnull",
    age: "integer:default=18",
    bio: "text",
  }
};
