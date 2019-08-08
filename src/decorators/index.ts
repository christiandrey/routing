import { PREFIX_METADATA_KEY, initializeRoutesMetadata, updateRoutesMetadata } from "elf-utils";

export const Controller = (prefix: string = ""): ClassDecorator => {
	return (target: Object) => {
		Reflect.defineMetadata(PREFIX_METADATA_KEY, prefix, target);

		// ----------------------------------------------------------------
		// REGISTER ROUTES METADATA FOR CONTROLLER IF IT DOES NOT EXIST
		// ----------------------------------------------------------------
		initializeRoutesMetadata(target);
	};
};

export const HttpGet = (path: string): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		updateRoutesMetadata("get", path, target.constructor, propertyName);
	};
};

export const HttpPost = (path: string): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		updateRoutesMetadata("post", path, target.constructor, propertyName);
	};
};

export const HttpPut = (path: string): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		updateRoutesMetadata("put", path, target.constructor, propertyName);
	};
};

export const HttpPatch = (path: string): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		updateRoutesMetadata("patch", path, target.constructor, propertyName);
	};
};

export const HttpDelete = (path: string): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		updateRoutesMetadata("delete", path, target.constructor, propertyName);
	};
};
