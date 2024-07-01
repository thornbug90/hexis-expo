import { Maybe } from "graphql/jsutils/Maybe";
import { Wearable_Status } from "../generated/graphql";
import integrationIcons, { IIntergrationIcon } from "../lib/integrations";

type IIntergration = {
  authorizationUrl?: Maybe<string>;
  description?: Maybe<string>;
  id: Maybe<string>;
  image: Maybe<string>;
  name: Maybe<string>;
  status: Wearable_Status;
  userId: Maybe<string>;
};

export const getImage: Function = (
  item: IIntergration | null,
  img: any
): any => {
  return item?.image ? { uri: item.image } : img;
};

export const getIntegrationImage: Function = (item: IIntergration) => {
  return getImage(
    item,
    integrationIcons.find(
      (integration: IIntergrationIcon) => integration.name === item.name
    )?.icon
  );
};
