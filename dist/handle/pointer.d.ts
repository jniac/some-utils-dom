import { HandleBasicPointerParams } from './pointer/basic';
import { HandleDragParams } from './pointer/drag';
import { HandleFocusParams } from './pointer/focus';
import { HandlePressParams } from './pointer/press';
import { HandleTapParams } from './pointer/tap';
import { PointerTarget } from './pointer/type';
import { HandleWheelParams } from './pointer/wheel';
import { HandleWheelFrameParams } from './pointer/wheel.frame';
type Params = HandleBasicPointerParams & HandleDragParams & HandleFocusParams & HandlePressParams & HandleTapParams & HandleWheelParams & HandleWheelFrameParams;
export declare function handlePointer(target: PointerTarget | PointerTarget[] | NodeListOf<PointerTarget>, params: Params): () => void;
export { PointerButton } from './pointer/type';
