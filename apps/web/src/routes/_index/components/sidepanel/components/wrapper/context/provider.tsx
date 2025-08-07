import { useCallback, useMemo, useReducer, useRef } from "react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { WrapperContext } from "./context";
import type { WrapperState } from "./types";

type WrapperProviderProps = Pick<WrapperState, "id" | "order"> & {
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
  const ref = useRef<ImperativePanelHandle | null>(null);

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

  const { order, id } = props;

  const value = useMemo(
    () => ({
      isCollapsed: state.isCollapsed,
      onToggleIsCollapse,
      ref,
      id,
      order,
    }),
    [onToggleIsCollapse, state.isCollapsed, id, order],
  );

  return (
    <WrapperContext.Provider value={value}>
      {props.children}
    </WrapperContext.Provider>
  );
}

export { WrapperProvider };
