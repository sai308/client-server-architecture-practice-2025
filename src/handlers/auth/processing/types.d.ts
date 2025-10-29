namespace Auth {
  export type AuthStrategy = Services.AuthMethod;

  export type PipeConfig = {
    allowSession?: boolean;
    allowApiKey?: boolean;
  };
}
