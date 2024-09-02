import TabsComponent from "@/components/reusable/TabsComponent";
import { TabsDataModel } from "@/models/TabsModel";
import React, { useState } from "react";

interface EditVaultModalProps {
  tabsData: TabsDataModel[];
  logo: string;
  selectedTab?: "Deposit" | "Withdraw";
}

const EditVaultModal: React.FC<EditVaultModalProps> = ({
  tabsData,
  logo,
  selectedTab = "Deposit",
}) => {
  const [selected, setSelected] = useState(selectedTab);
  return (
    <TabsComponent
      tabsData={tabsData}
      logo={logo}
      inModal
      selected={selected}
      setSelected={setSelected}
    />
  );
};
export default EditVaultModal;
