import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type ModuleWithDefault = { default: ComponentType<unknown> };

/**
 * Wraps React.lazy with a readable Error when a route chunk fails to load.
 */
export function lazyRoute(
  loader: () => Promise<ModuleWithDefault>,
  label: string,
): LazyExoticComponent<ComponentType<unknown>> {
  return lazy(async () => {
    try {
      const module = await loader();
      if (typeof module.default !== "function") {
        throw new Error(`${label} has no default export`);
      }
      return module;
    } catch (cause) {
      const detail =
        cause instanceof Error ? cause.message : "Unknown import failure";
      throw new Error(`Failed to load route "${label}": ${detail}`, {
        cause,
      });
    }
  });
}
