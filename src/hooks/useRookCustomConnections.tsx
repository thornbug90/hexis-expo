export const useRookCustomConnections = async () => {
  try {
    const response = await fetch(
      `https://api.rook-connect.review/api/v1/client_uuid/072bc6d0-0016-4329-93b4-002f9d2d61b6/user_id/clnc41vsq0003m721p478p4xn/data_sources/authorizers`
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};
