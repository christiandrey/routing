import "reflect-metadata";
import { Request, Response, Express } from "express";
import { loadTsClassesFromDirectory, PREFIX_METADATA_KEY, ROUTES_METADATA_KEY, IRouteDefinition, HttpStatusCodes, HttpResponse } from "elf-utils";
import { AuthorizeUser, AuthorizeUserRoles, AuthorizeUsers } from "elf-authentication";
import { ControllersType } from "../types";
import { AuthorizeUserPermissions } from "elf-authentication/src/methods";

export const RegisterRoutes = (app: Express, resolveController?: (controller: any) => any, controllers: ControllersType = "src/controller") => {
	if (typeof controllers === "undefined" || typeof controllers === "string") {
		controllers = loadTsClassesFromDirectory(controllers);
	}

	controllers.forEach(controller => {
		const instance = !!resolveController ? resolveController(controller) : new controller();
		const prefix = Reflect.getMetadata(PREFIX_METADATA_KEY, controller) as string;
		const routes = Reflect.getMetadata(ROUTES_METADATA_KEY, controller) as Array<IRouteDefinition>;

		routes.forEach(route => {
			const { path, action, requestType, authorize, allowAnonymous, checkPermissions, roles, users } = route;
			const shouldAuthorize = !(!!allowAnonymous || !authorize);

			if (shouldAuthorize) {
				app[requestType](`/${prefix}/${path}`, AuthorizeUser, async (req: Request, res: Response, next: Function) => {
					try {
						AuthorizeUserRoles(req, roles);
						AuthorizeUsers(req, users);
						!!checkPermissions && AuthorizeUserPermissions(req, `${requestType}:${prefix}:${path}`);
					} catch (error) {
						res.status(HttpStatusCodes.unauthorized).send();
						return;
					}

					const result: HttpResponse = await instance[action](req, res, next);
					res.status(result.code).json(result.data);
				});
			} else {
				app[requestType](`/${prefix}/${path}`, async (req: Request, res: Response, next: Function) => {
					const result: HttpResponse = await instance[action](req, res, next);
					res.status(result.code).json(result.data);
				});
			}
		});
	});
};
