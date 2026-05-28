import fetch from 'node-fetch';

async function test() {
    const sandboxBaseUrl = "https://sandbox-quickbooks.api.intuit.com";
    const realmId = "9341457098560724";
    const token = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..cqnLxSWRPL0FV-9Y_ALQOA.oSGyRU3jqATUjlfBJmHCfdPA9vuejpnHu3XfrYNJYQ5awTbpAMfCgDjLQ_fpIt9aMRdW4_oTvqvZczAyHb4Hvk5giCEAYlaOwA7klnNDCWpOnyqiv0NiVkz57No5KAf3DR_KhJYppIkgcfFoi7ChrDrbnUBS0-Ytyup6SxZYH-_1_njl35O9Q_w2KIyZi0LRHArSalYxO4PjLk40kAuib0prJx-pMWa4KBIUHfF7SLp1Inq_oJ8pGooWEw8kPlfpOfLJ6EYtUuviqAuSslt2-WZMfmJPosl-3Se-y6bRsWmi3GfdIYnmYkCqAkMWUHH7kB34Hqrb0BgINo1Q2q4dNWO77QUKcHGG5sP8tV7zOJm7uueI4B4v65Abi7wrRzCZVM_TiTW6We9QOx45oGEv0qki_RxSD1tNCLU8KScDeMMeKu6LD1j_c2k6t74QjUoHhwrNyPwQQ2e_mo7Qvz9upVdsuzWyhIeJRWxr7vNIuNg.vnC4YXpjKzDksm1ps5j--A";

    const url = `${sandboxBaseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?minorversion=70`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    const body = await response.text();
    console.log("Status:", response.status);
    console.log("Body:", body.substring(0, 500));
}
test();
