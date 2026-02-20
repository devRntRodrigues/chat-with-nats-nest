export interface ICommandHandler<TCommand = any, TResult = any> {
  execute(command: TCommand): Promise<TResult>;
}
