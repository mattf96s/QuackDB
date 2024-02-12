import { useCallback, useMemo, useReducer } from "react";
import { WrapperContext } from "./context";
import type { WrapperState } from "./types";

type WrapperProviderProps = {
  children: React.ReactNode;
};

type State = Pick<WrapperState, "isCollapsed">;
type Action = {
  type: "TOGGLE_COLLAPSE";
  payload: {
    isCollapsed: boolean;
  };
};

function wrapperReducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_COLLAPSE":
      return {
        ...state,
        isCollapsed: action.payload.isCollapsed,
      };
    default:
      return { ...state };
  }
}

function WrapperProvider(props: WrapperProviderProps) {
  const [state, dispatch] = useReducer(wrapperReducer, {
    isCollapsed: false,
  });

  const onToggleIsCollapse = useCallback(
    (isCollapsed: boolean) =>
      dispatch({
        type: "TOGGLE_COLLAPSE",
        payload: {
          isCollapsed,
        },
      }),
    [],
  );

  const value = useMemo(
    () => ({
      isCollapsed: state.isCollapsed,
      onToggleIsCollapse,
    }),
    [onToggleIsCollapse, state.isCollapsed],
  );

  return (
    <WrapperContext.Provider value={value}>
      {props.children}
    </WrapperContext.Provider>
  );
}

export { WrapperProvider };
