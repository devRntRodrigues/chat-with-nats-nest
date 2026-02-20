import type { Msg } from '@nats-io/nats-core';

interface Handler {
  (topic: string, payload: any, message: Msg): void;
}

interface TopicNode {
  children: Map<string, TopicNode>;
  handler?: Handler;
  wildcardChild?: TopicNode;
}

export class BrokerRouter {
  private readonly root: TopicNode;

  constructor() {
    this.root = { children: new Map() };
  }

  addRoute(topic: string, handler: Handler): void {
    const parts = topic.split('.');
    let currentNode = this.root;

    for (const part of parts) {
      if (part === '>') {
        if (currentNode.wildcardChild && currentNode.wildcardChild.handler) {
          console.warn(
            `Warning: A handler is already registered for the wildcard route "${topic}".`,
          );
        }
        currentNode.wildcardChild = {
          children: new Map(),
          handler,
        };
        return;
      }
      if (!currentNode.children.has(part)) {
        currentNode.children.set(part, { children: new Map() });
      }
      currentNode = currentNode.children.get(part)!;
    }

    if (currentNode.handler) {
      console.warn(
        `Warning: A handler is already registered for the route "${topic}".`,
      );
    }
    currentNode.handler = handler;
  }

  getHandler(topic: string): Handler | undefined {
    const parts = topic.split('.');
    const handler = this.findHandler(parts, 0, this.root);

    if (handler) return handler;

    // console.warn(`Warning: Not found handler for the route "${topic}".`);

    return undefined;
  }

  private findHandler(
    parts: string[],
    index: number,
    node: TopicNode,
  ): Handler | undefined {
    if (index === parts.length) {
      return node.handler;
    }

    const part = parts[index];
    let handler: Handler | undefined;

    const child = node.children.get(part);
    if (child) {
      handler = this.findHandler(parts, index + 1, child);
      if (handler) return handler;
    }

    const wildcardChild = node.children.get('*');
    if (wildcardChild) {
      handler = this.findHandler(parts, index + 1, wildcardChild);
      if (handler) return handler;
    }

    if (node.wildcardChild) {
      return node.wildcardChild.handler;
    }

    return undefined;
  }
}
