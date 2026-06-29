import { addIcons } from 'ionicons';
import {
  add,
  closeCircle,
  trash,
  create,
  book,
  person,
  settings,
  home,
  libraryOutline,
  constructOutline,
  swapHorizontal,
  receiptOutline,
  personCircleOutline,
  homeOutline,
  logOutOutline,
  peopleOutline,
  ellipsisHorizontalOutline,
  eyeOutline,
  createOutline,
  searchOutline,
  checkmarkOutline,
} from 'ionicons/icons';

export const iconosApp = {
  'home-outline': homeOutline,
  'library-outline': libraryOutline,
  'construct-outline': constructOutline,
  'swap-horizontal': swapHorizontal,
  'receipt-outline': receiptOutline,
  'person-circle-outline': personCircleOutline,
  settings: settings,
  'log-out-outline': logOutOutline,
  'people-outline': peopleOutline,
  'ellipsis-horizontal-outline': ellipsisHorizontalOutline,
  home: home,
  add: add,
  'close-circle': closeCircle,
  trash: trash,
  create: create,
  book: book,
  person: person,
  'eye-outline': eyeOutline,
  'create-outline': createOutline,
  'search-outline': searchOutline,
  'checkmark-outline': checkmarkOutline,
};

export type IconosAppType = keyof typeof iconosApp;

export const registrarIconos = () => {
  addIcons(iconosApp);
};
