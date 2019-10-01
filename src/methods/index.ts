import "reflect-metadata";
import * as path from "path";
import * as fs from "fs";
import { Request, Response, Express } from "express";
import { loadTsClassesFromDirectory, PREFIX_METADATA_KEY, ROUTES_METADATA_KEY, IRouteDefinition, HttpStatusCodes, HttpResponse } from "elf-utils";
import { AuthorizeUser, AuthorizeUserRoles, AuthorizeUsers } from "elf-authentication";
import { ControllersType } from "../types";
import { AuthorizeUserPermissions } from "elf-authentication/src/methods";

export const RegisterRoutes = (
	app: Express,
	resolveController?: (controller: any) => any,
	controllers: ControllersType = "src/controller",
	generatePermissionsFile = false
) => {
	if (typeof controllers === "undefined" || typeof controllers === "string") {
		controllers = loadTsClassesFromDirectory(controllers);
	}

	let permissionsContent = "// PERMISSIONS\n[\n";

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
						!!checkPermissions && AuthorizeUserPermissions(req, `${requestType}.${prefix}.${path}`);
					} catch (error) {
						res.status(HttpStatusCodes.unauthorized).send();
						return;
					}

					const result: HttpResponse = await instance[action](req, res, next);
					res.status(result.code).json(result.data);
				});

				permissionsContent = permissionsContent + `{\nvalue: "${requestType}.${prefix}.${path}",\ndescription: "${getActionSentence(action, prefix)}"\n},\n`;
			} else {
				app[requestType](`/${prefix}/${path}`, async (req: Request, res: Response, next: Function) => {
					const result: HttpResponse = await instance[action](req, res, next);
					res.status(result.code).json(result.data);
				});
			}
		});
	});

	if (!!generatePermissionsFile) {
		const filePath = path.resolve(process.cwd(), "./elf.permissions.ts");
		fs.writeFileSync(filePath, permissionsContent + "]");
	}
};

const getSentenceCase = (text: string) => {
	return `${text[0].toUpperCase()}${text.slice(1)}`;
};

const getActionSentence = (action: string, prefix: string) => {
	let sentence = ``;
	let singularPrefix = prefix.substring(0, prefix.length - 1);

	switch (action) {
		case "create":
			sentence = `Create a new ${singularPrefix}`;
			break;
		case "getById":
			sentence = `Get a ${singularPrefix} by its Id`;
			break;
		case "getAll":
			sentence = `Get all ${prefix}`;
			break;
		case "getAllLite":
			sentence = `Get a lightweight version of all ${prefix}`;
			break;
		case "update":
			sentence = `Update a ${singularPrefix}`;
			break;
		case "delete":
			sentence = `Delete a ${singularPrefix}`;
			break;
		case "deleteAll":
			sentence = `Deletes all ${prefix}`;
			break;
		case "activate":
			sentence = `Activate a ${singularPrefix}`;
			break;
		case "deactivate":
			sentence = `Deactivate a ${singularPrefix}`;
			break;
		default:
			sentence = `${action}`;
			break;
	}
	sentence = `${getSentenceCase(prefix)}: ${sentence}`;

	return sentence;
};
