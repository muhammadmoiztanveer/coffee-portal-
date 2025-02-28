import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button, Tabs, theme, message } from "antd";
import {
  SearchOutlined,
  DeleteFilled,
  EditFilled,
  PlusCircleFilled,
} from "@ant-design/icons";
import EditDepositModal from "@/components/modals/editDepositModal/editDepositModal";
import AddDepositModal from "../../components/modals/addDepositModal/addDepositModal";
import MakePurchaseModal from "../../components/modals/makePurchaseModal/makePurchaseModal";
import {
  getNextTokenForUsers,
  GetUserWithLastDeposit,
} from "../../graphql/customQueries";
import { listUsers } from "@/graphql/queries";
import { generateClient } from "aws-amplify/api";
import { updateUsers, deleteUsers } from "@/graphql/mutations";
import { createDeposits, updateDeposits } from "../../graphql/mutations";
import { createPayments } from "../../graphql/mutations";

const paymentManagmentPage = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  // useEffect(() => {
  //   console.log("dataaa", data);
  // }, data);

  const [messageApi, contextHolder] = message.useMessage();
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [nextTokens, setNextTokens] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [excessRecords, setExcessRecords] = useState({});
  const [users, setUsers] = useState([]);
  const [searchFilter, setSearchFilter] = useState([]);
  const searchInput = useRef(null);

  const isFetching = useRef(false);
  const client = generateClient();

  // Delete Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  //   const navigate = useNavigate();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddDepositModalVisible, setIsAddDepositModalVisible] =
    useState(false);
  const [isMakePurchaseModalVisible, setIsMakePurchaseModalVisible] =
    useState(false);

  const [userToEdit, setUserToEdit] = useState(null);

  const [isDepositsTableVisible, setIsDepositsTableVisible] = useState(true);
  const [isPurchasesTableVisible, setIsPurchasesTableVisible] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  useEffect(() => {
    let totalUsers = 0;

    totalUsers =
      parseInt(nextTokens.length) * parseInt(tableParams.pagination.pageSize);

    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: totalUsers,
      },
    }));
  }, [nextTokens]);

  const fetchTotalCount = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setIsContentLoading(true);

    let paginationToken = null;

    try {
      do {
        const response = await client.graphql({
          query: getNextTokenForUsers,
          variables: {
            limit: tableParams.pagination.pageSize,
            nextToken: paginationToken,
          },
        });

        if (!response.data || !response.data.listUsers) {
          console.error("Invalid response format:", response);
          messageApi.open({
            type: "error",
            content: "Error fetching users. Invalid response from the server.",
          });
          break;
        }

        paginationToken = response.data.listUsers.nextToken;

        if (paginationToken) {
          setNextTokens((prev) => [...prev, paginationToken]);
        }
      } while (paginationToken);
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching users. Please try again later.",
      });
    } finally {
      isFetching.current = false;
      setLoading(false);
      setIsContentLoading(false);
    }
  };

  const listUsersData = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = tableParams.pagination;
      const nextToken = current === 1 ? null : nextTokens[current - 1];

      const response = await client.graphql({
        query: listUsers,
        variables: {
          limit: pageSize,
          nextToken: nextToken,
        },
      });

      const { items } = response.data.listUsers;
      setUsers(items);
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching users. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("pagination changed", tableParams);

    if (searchFilter.length > 0) {
      listSearchedUsersData();
    } else {
      listUsersData();
    }
  }, [tableParams.pagination.current, tableParams.pagination.pageSize]);

  useEffect(() => {
    fetchTotalCount();
    listUsersData();
  }, []);

  // START - Make Purchase Modal
  const showMakePurchaseModal = (user) => {
    setUserToEdit(user);
    setIsMakePurchaseModalVisible(true);
  };

  const handleMakePurchaseUser = async (values) => {
    console.log("valuess", values);

    try {
      const updateValues = {
        id: values.id,
        balance: values.balance,
        stamps: values.stamps,
        purchaseCount: values.purchaseCount,
        coins: values.coins,
        freeDrinks: values.freeDrinks,
      };

      const updateUserResponse = await client.graphql({
        query: updateUsers,
        variables: { input: updateValues },
      });

      listUsersData();

      const paymentHistory = {
        userID: values.id,
        amount: values.purchaseBill,
        stamps: values.userStamps,
      };

      const createPaymentHistoryResposne = await client.graphql({
        query: createPayments,
        variables: { input: paymentHistory },
      });

      messageApi.open({
        type: "success",
        content: "Payment Successfully !",
      });
    } catch (error) {
      console.error("Error updating user:", error);

      messageApi.open({
        type: "error",
        content: "Error making Payment !",
      });
    }
  };

  const handleCancelMakePurchase = () => {
    setIsMakePurchaseModalVisible(false);
    setUserToEdit(null); // Clear the user data after cancel
  };
  // END - Make Purchase Modal

  // START - Add Deposit Modal
  const showAddDepositModal = (user) => {
    setUserToEdit(user);
    setIsAddDepositModalVisible(true);
  };

  const handleAddDepositUser = async (values) => {
    try {
      const updateValues = {
        id: values.id,
        balance: values.balance,
        stamps: values.stamps,
      };

      const updateUserResponse = await client.graphql({
        query: updateUsers,
        variables: { input: updateValues },
      });

      listUsersData();

      const despositHistory = {
        userID: values.id,
        amount: values.depositBalance,
        paymentType: values.paymentType,
      };

      const createDepositHistoryResposne = await client.graphql({
        query: createDeposits,
        variables: { input: despositHistory },
      });

      messageApi.open({
        type: "success",
        content: "Amount Deposited Successfully !",
      });
    } catch (error) {
      console.error("Error updating user:", error);

      messageApi.open({
        type: "error",
        content: "Error Depositing Amount !",
      });
    }
  };

  const handleCancelAddDeposit = () => {
    setIsAddDepositModalVisible(false);
    setUserToEdit(null);
  };
  // END - Add Deposit Modal

  // START - Edit Deposit Modal
  const showEditDepositModal = async (userId) => {
    const getUserWithLastDepositResponse = await client.graphql({
      query: GetUserWithLastDeposit,
      variables: { userId: `${userId}` },
    });

    const userInfo = getUserWithLastDepositResponse.data.getUsers;

    setUserToEdit(userInfo);
    setIsEditModalVisible(true);
  };

  const handleEditDepositUser = async (values) => {
    try {
      const updateValues = {
        id: values.id,
        balance: values.balance,
        stamps: values.stamps,
      };

      const updateUserResponse = await client.graphql({
        query: updateUsers,
        variables: { input: updateValues },
      });

      listUsersData();

      const updateDespositHistory = {
        id: values.deposits.items[0].id,
        userID: values.id,
        amount: values.deposits.items[0].amount,
      };

      const createDepositHistoryResposne = await client.graphql({
        query: updateDeposits,
        variables: { input: updateDespositHistory },
      });

      messageApi.open({
        type: "success",
        content: "Last Deposited Amount Edited Successfully !",
      });
    } catch (error) {
      console.error("Error updating user:", error);

      messageApi.open({
        type: "error",
        content: "Error Editing Last Depositing Amount !",
      });
    }
  };

  const handleCancelEditDeposit = () => {
    setIsEditModalVisible(false);
    setUserToEdit(null);
  };
  // END - Edit Deposit Modal

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const depositsTableColumns = [
    {
      title: "Email",
      dataIndex: "email",
      // sorter: true,
      render: (email) => email || "N/A",
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      // sorter: true,
      render: (name) => {
        if (name && name.first && name.last) {
          return `${name.first} ${name.last}`;
        } else {
          return "N/A";
        }
      },
      ...getColumnSearchProps("name"),
    },
    {
      title: "Total Balance",
      dataIndex: "balance",
      render: (balance) => (balance !== "" ? balance : "N/A"),
    },
    {
      title: "Stamps",
      dataIndex: "stamps",
      render: (stamps) => (stamps !== "" ? stamps : "N/A"),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          {/* Edit Icon */}
          <button
            className="text-base cursor-pointer border rounded-lg py-1 px-2"
            onClick={() => showEditDepositModal(record.id)}
          >
            <EditFilled />
          </button>

          {/* Delete Icon */}
          <button
            className="text-base text-green-600 cursor-pointer border rounded-lg py-1 px-2"
            onClick={() => showAddDepositModal(record)}
          >
            <PlusCircleFilled />
          </button>
        </div>
      ),
    },
  ];

  const paymentsTableColumns = [
    {
      title: "Email",
      dataIndex: "email",
      // sorter: true,
      render: (email) => email || "N/A",
    },
    {
      title: "Customer Name",
      dataIndex: "name",
      // sorter: true,
      render: (name) => {
        if (name && name.first && name.last) {
          return `${name.first} ${name.last}`;
        } else {
          return "N/A";
        }
      },
      ...getColumnSearchProps("name"),
    },
    {
      title: "Total Balance",
      dataIndex: "balance",
      render: (balance) => (balance !== "" ? balance : "N/A"),
    },
    {
      title: "Stamps",
      dataIndex: "stamps",
      render: (stamps) => (stamps !== "" ? stamps : "N/A"),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex">
          {/* Edit Icon */}
          <Button onClick={() => showMakePurchaseModal(record)}>
            Make a Purchase
          </Button>
        </div>
      ),
    },
  ];

  const getRandomuserParams = (params) => ({
    results: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
  });

  // const fetchData = () => {
  //   setLoading(true);
  //   fetch(
  //     `https://randomuser.me/api?${qs.stringify(
  //       getRandomuserParams(tableParams)
  //     )}`
  //   )
  //     .then((res) => res.json())
  //     .then(({ results }) => {
  //       setData(results);
  //       setLoading(false);
  //       setTableParams({
  //         ...tableParams,
  //         pagination: {
  //           ...tableParams.pagination,
  //           total: 200,
  //           // 200 is mock data, you should read it from server
  //           // total: data.totalCount,
  //         },
  //       });
  //     });
  // };

  // useEffect(fetchData, [
  //   tableParams.pagination?.current,
  //   tableParams.pagination?.pageSize,
  //   tableParams?.sortOrder,
  //   tableParams?.sortField,
  //   JSON.stringify(tableParams.filters),
  // ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  function showDepositsTable() {
    setIsPurchasesTableVisible(false);
    setIsDepositsTableVisible(true);
  }

  function showPurchasesTable() {
    setIsDepositsTableVisible(false);
    setIsPurchasesTableVisible(true);
  }

  return (
    <>
      {contextHolder}

      <div className="flex flex-col gap-10 mt-8">
        <div className="text-2xl font-medium">Payment Managment</div>

        <div className="flex gap-6 font-medium">
          <button
            className={
              isDepositsTableVisible
                ? "w-full py-4 bg-primary text-white rounded-xl"
                : "w-full py-4 bg-white hover:bg-primary/80 text-primary hover:text-white rounded-xl"
            }
            onClick={showDepositsTable}
          >
            Manage Deposits
          </button>
          <button
            className={
              isPurchasesTableVisible
                ? "w-full py-4 bg-primary text-white rounded-xl"
                : "w-full py-4 bg-white hover:bg-primary/80 text-primary hover:text-white rounded-xl"
            }
            onClick={showPurchasesTable}
          >
            Manage Purchases
          </button>
        </div>

        {isDepositsTableVisible && (
          <Table
            columns={depositsTableColumns}
            rowKey={(record) => record.id}
            dataSource={users}
            pagination={{
              ...tableParams.pagination,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
            loading={loading}
            onChange={handleTableChange}
          />
        )}

        {isPurchasesTableVisible && (
          <Table
            columns={paymentsTableColumns}
            rowKey={(record) => record.id}
            dataSource={users}
            pagination={{
              ...tableParams.pagination,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
            loading={loading}
            onChange={handleTableChange}
          />
        )}

        <EditDepositModal
          isVisible={isEditModalVisible}
          onCancel={handleCancelEditDeposit}
          initialValues={userToEdit}
          onSubmit={handleEditDepositUser}
        />

        <AddDepositModal
          isVisible={isAddDepositModalVisible}
          onCancel={handleCancelAddDeposit}
          initialValues={userToEdit}
          onSubmit={handleAddDepositUser}
        />

        <MakePurchaseModal
          isVisible={isMakePurchaseModalVisible}
          onCancel={handleCancelMakePurchase}
          initialValues={userToEdit}
          onSubmit={handleMakePurchaseUser}
        />
      </div>
    </>
  );
};

export default paymentManagmentPage;
