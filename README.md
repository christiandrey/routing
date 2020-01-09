# Elf Routing

Elf Routing is the routing solution for the Elf- suite. It provides utilities that make routing a TypeORM + Express app a breeze.

## Methods

---

### RegisterRoutes(app, resolveController, controllers, generatePermissionsFile)

> The `RegisterRoutes` initializes the configured routes. The parameters are described below:

- `app`: The express app
- `resolveController?`: If you use Dependency Injection, provide a means to resolve a controller. If this is left undefined, a new instance of every controller is created every time it's needed.
- `controllers?`: A path to the controllers folder. Default value is `src/controller`
- `generatePermissionsFile?`: Generate a permissions file from methods that have the `checkPermissions` flag set to `true` via the Elf Authentication library. The permissions are written to a `elf.permissions.ts` file in the root folder.

## Decorators

---

The following decorators are provided

### @Controller(name)

---

> Decorating a class with `@Controller()` makes it a controller. The name parameter specifies the route to be assigned to the controller.

### @HttpPost(match)

---

> Decorate a method within a controller class with this decorator to make it respond to POST requests. Use the match variable to specify a match pattern.

### @HttpGet(match)

---

> Decorate a method within a controller class with this decorator to make it respond to GET requests. Use the match variable to specify a match pattern.

### @HttpPut(match)

---

> Decorate a method within a controller class with this decorator to make it respond to PUT requests. Use the match variable to specify a match pattern.

### @HttpPatch(match)

---

> Decorate a method within a controller class with this decorator to make it respond to PATCH requests. Use the match variable to specify a match pattern.

### @HttpDelete(match)

---

> Decorate a method within a controller class with this decorator to make it respond to DELETE requests. Use the match variable to specify a match pattern.
