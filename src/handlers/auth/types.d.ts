import '@fastify/request-context';
import {
  preHandlerAsyncHookHandler,
  preSerializationAsyncHookHandler,
} from 'fastify';

declare module 'fastify' {
  interface FastifyInstance<
    RawServer,
    RawRequest,
    RawReply,
    Logger,
    TypeProvider,
  > {
    authPipeFactory<
      Request extends FastifyRequest = FastifyRequest,
      Reply extends FastifyReply = FastifyReply,
    >(
      config?: Auth.PipeConfig
    ): preHandlerAsyncHookHandler<
      RawServer,
      RawRequest,
      RawReply,
      RouteGenericInterface,
      ContextConfigDefault,
      FastifySchema,
      TypeProvider,
      Logger
    >;

    authGuardFactory<
      Request extends FastifyRequest = FastifyRequest,
      Reply extends FastifyReply = FastifyReply,
    >(config?: {
      isPrivilegeRequired?: boolean;
      authMethod?: Services.AuthMethod;
    }): preHandlerAsyncHookHandler<
      RawServer,
      RawRequest,
      RawReply,
      RouteGenericInterface,
      ContextConfigDefault,
      FastifySchema,
      TypeProvider,
      Logger
    >;

    guestGuardFactory<
      Request extends FastifyRequest = FastifyRequest,
      Reply extends FastifyReply = FastifyReply,
    >(config?: {
      redirectPath?: string;
      statusCode?: 301 | 302 | 303 | 307 | 308;
    }): preHandlerAsyncHookHandler<
      RawServer,
      RawRequest,
      RawReply,
      RouteGenericInterface,
      ContextConfigDefault,
      FastifySchema,
      TypeProvider,
      Logger
    >;
  }
}

interface ContextShape {
  authData: {
    user: Services.AuthenticatedUser;
    method: Services.AuthMethod;
    sessionId: string | null;
    ipAddress: string;
  } | null;
}

/**
 * Extend the RequestContextData interface from the module.
 * This is where you define the properties available in your context store.
 */
declare module '@fastify/request-context' {
  interface RequestContextData extends ContextShape {}
}
