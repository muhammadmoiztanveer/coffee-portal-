import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Button, message, Spin } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, DeleteFilled, EditFilled } from "@ant-design/icons";
import DeleteModal from "@/components/modals/deleteModal/deleteModal";
import { getNextTokenForDrinks } from "../../graphql/customQueries";
import { listDrinks } from "@/graphql/queries";
import { generateClient } from "aws-amplify/api";
import { updateDrinks, deleteDrinks } from "@/graphql/mutations";
import AddNewDrinkModal from "../../components/modals/addNewDrinkModal/addNewDrinkModal";
import EditDrinkModal from "../../components/modals/editDrinkModal/editDrinkModal";
import { createDrinks } from "../../graphql/mutations";

const storeManagmentPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [nextTokens, setNextTokens] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [excessRecords, setExcessRecords] = useState({});
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [isAddNewDrinkModalVisible, setIsAddNewDrinkModalVisible] =
    useState(false);
  const [isDrinkAddingPending, setIsDrinkAddingPending] = useState(false);
  const [drinkToAdd, setDrinkToAdd] = useState(null);

  const [isEditDrinkModalVisible, setIsEditDrinkModalVisible] = useState(false);
  const [drinkToEdit, setDrinkToEdit] = useState(null);
  const [filteredDrinks, setFilteredDrinks] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [searchFilter, setSearchFilter] = useState([]);
  const searchInput = useRef(null);

  const isFetching = useRef(false);
  const client = generateClient();

  useEffect(() => {
    let totalDrinks = 0;

    totalDrinks =
      parseInt(nextTokens.length) * parseInt(tableParams.pagination.pageSize);

    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: totalDrinks,
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
          query: getNextTokenForDrinks,
          variables: {
            limit: tableParams.pagination.pageSize,
            nextToken: paginationToken,
          },
        });

        if (!response.data || !response.data.listDrinks) {
          console.error("Invalid response format:", response);
          messageApi.open({
            type: "error",
            content: "Error fetching Drinks. Invalid response from the server.",
          });
          break;
        }

        paginationToken = response.data.listDrinks.nextToken;

        if (paginationToken) {
          setNextTokens((prev) => [...prev, paginationToken]);
        }
      } while (paginationToken);
    } catch (error) {
      console.error("Error fetching Drinks:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching Drinks. Please try again later.",
      });
    } finally {
      isFetching.current = false;
      setLoading(false);
      setIsContentLoading(false);
    }
  };

  const listDrinksData = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = tableParams.pagination;
      const nextToken = current === 1 ? null : nextTokens[current - 1];

      const response = await client.graphql({
        query: listDrinks,
        variables: {
          limit: pageSize,
          nextToken: nextToken,
        },
      });

      const { items } = response.data.listDrinks;
      setDrinks(items);
    } catch (error) {
      console.error("Error fetching Drinks:", error);
      messageApi.open({
        type: "error",
        content: "Error fetching Drinks. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchedTotalCount = async () => {
    setLoading(true);

    try {
      const filter =
        searchFilter.length > 0
          ? {
              and: searchFilter.map((filterObj) => ({
                or: [
                  {
                    [filterObj.columnName]: {
                      contains: filterObj.search.toLowerCase(),
                    },
                  },
                  {
                    [filterObj.columnName]: {
                      beginsWith: filterObj.search.toLowerCase(),
                    },
                  },
                ],
              })),
            }
          : undefined;

      setLoading(true);

      const response = await client.graphql({
        query: listDrinks,
        variables: {
          limit: 1000,
          nextToken: null,
          filter: filter,
        },
      });

      const { items } = response.data.listDrinks;

      const total = items.length;

      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: total,
        },
      }));

      setFilteredDrinks(items);
    } catch (error) {
      console.error("Error fetching drinks:", error);

      messageApi.open({
        type: "error",
        content: "Error fetching users. Please try again later.",
      });
    }
  };

  useEffect(() => {
    if (filteredDrinks.length > 0) {
      listSearchedDrinksData();
    }
  }, [filteredDrinks]);

  const listSearchedDrinksData = async () => {
    try {
      setLoading(true);

      const { current, pageSize } = tableParams.pagination;
      const start = (current - 1) * pageSize;
      const end = start + pageSize;

      const drinksData = filteredDrinks.slice(start, end);

      setDrinks(drinksData);
    } catch (error) {
      console.error("Error processing data:", error);

      messageApi.open({
        type: "error",
        content: "Error displaying data. Please try again later.",
      });
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalCount();
    listDrinksData();
  }, []);

  const showAddNewDrinkModal = () => {
    setIsAddNewDrinkModalVisible(true);
    setDrinkToAdd(null);
  };

  const handleCancelAddNewDrink = () => {
    setIsAddNewDrinkModalVisible(false);
  };

  const handleAddNewDrink = async (values, setSubmitting) => {
    setSubmitting(true); // Start submitting state
    try {
      const newDrink = {
        name: values.name,
        price: values.price,
      };
      const addNewDrinkResponse = await client.graphql({
        query: createDrinks,
        variables: { input: newDrink },
      });
      listDrinksData(); // Refresh the drinks list
      messageApi.open({
        type: "success",
        content: `Drink added successfully!`,
      });
    } catch (error) {
      console.error("Error adding drink:", error);
      messageApi.open({
        type: "error",
        content: "There was an error adding the drink. Please try again.",
      });
    } finally {
      setSubmitting(false);
      setIsAddNewDrinkModalVisible(false);
    }
  };

  // START - EDIT MOdal
  const handleEditDrink = async (values, setSubmitting) => {
    setSubmitting(true); // Start submitting state
    try {
      const editedDrink = {
        id: values.id,
        name: values.name,
        price: values.price,
      };
      await client.graphql({
        query: updateDrinks,
        variables: { input: editedDrink },
      });
      listDrinksData(); // Refresh the drinks list
      messageApi.open({
        type: "success",
        content: `Record updated successfully for ${values.name}!`,
      });
    } catch (error) {
      console.error("Error updating drink:", error);
      messageApi.open({
        type: "error",
        content: "There was an error updating the record. Please try again.",
      });
    } finally {
      setSubmitting(false); // End submitting state
      setIsEditDrinkModalVisible(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDrinkModalVisible(false);
    setDrinkToEdit(null);
  };

  const showEditModal = (drink) => {
    console.log("drinkkk", drink);
    setDrinkToEdit(drink);
    setIsEditDrinkModalVisible(true);
  };
  // END - Edit Modal

  // START - Delete Modal
  const showModal = (drinkId) => {
    setRecordToDelete(drinkId);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      if (recordToDelete) {
        console.log("Deleting record:", recordToDelete);

        const drinkToDelete = {
          id: recordToDelete,
        };

        const deleteDrinksResponse = await client.graphql({
          query: deleteDrinks,
          variables: { input: drinkToDelete },
        });

        messageApi.open({
          type: "success",
          content: `Record deleted successfully !`,
        });
      }

      listDrinksData();

      setIsModalVisible(false);
      setRecordToDelete(null);
    } catch (err) {
      console.error("Drink Delete error :", err);
      messageApi.open({
        type: "error",
        content: `Error Deleting record !`,
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setRecordToDelete(null);
  };

  const handleDelete = (userId) => {
    showModal(userId);
  };
  // END - Delete Modal

  // START - Search Filter
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();

    setSearchFilter((prev) => {
      const updatedFilters = [...prev];

      const searchValue = selectedKeys?.[0]?.trim();

      if (!searchValue) {
        const existingFilterIndex = updatedFilters.findIndex(
          (filter) => filter.columnName === dataIndex
        );

        if (existingFilterIndex !== -1) {
          updatedFilters.splice(existingFilterIndex, 1);
        }

        return updatedFilters;
      }

      const existingFilterIndex = updatedFilters.findIndex(
        (filter) => filter.columnName === dataIndex
      );

      if (existingFilterIndex !== -1) {
        updatedFilters[existingFilterIndex] = {
          columnName: dataIndex,
          search: searchValue,
        };
      } else {
        updatedFilters.push({ columnName: dataIndex, search: searchValue });
      }

      return updatedFilters;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (searchFilter.length > 0) {
        setFilteredDrinks([]);
        setDrinks([]);

        await fetchSearchedTotalCount();
      } else {
        setNextTokens([]);
        setDrinks([]);

        await fetchTotalCount();
        await listDrinksData();
      }
    };

    fetchData();
  }, [searchFilter]);

  useEffect(() => {
    if (searchFilter.length > 0) {
      listSearchedDrinksData();
    } else {
      listDrinksData();
    }
  }, [tableParams.pagination.current, tableParams.pagination.pageSize]);

  const handleReset = async (clearFilters, dataIndex, close) => {
    clearFilters();

    setSearchFilter((prev) =>
      prev.filter((filter) => filter.columnName !== dataIndex)
    );

    close();
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
            onClick={() =>
              clearFilters && handleReset(clearFilters, dataIndex, close)
            }
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
              close();
            }}
          >
            Close
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
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text, record, index) => {
      // Include record and index if needed
      const relevantFilter = searchFilter.find(
        (filter) => filter.columnName === dataIndex
      );

      if (relevantFilter && relevantFilter.search) {
        // Check if a filter exists for this column *and* has a search term
        return (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[relevantFilter.search]} // Use the search term from the filter
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        );
      } else {
        return text; // Return original text if no filter or no search term
      }
    },
  });
  // END - Search Filter

  const columns = [
    {
      title: "Drink Name",
      dataIndex: "name",
      render: (name) => `${name.first} ${name.last}`,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          {/* Edit Icon */}
          <button
            className="text-base cursor-pointer border rounded-lg py-1 px-2"
            onClick={() => showEditModal(record)}
          >
            <EditFilled />
          </button>

          {/* Delete Icon */}
          <button
            className="text-base text-red-600 cursor-pointer border rounded-lg py-1 px-2"
            onClick={() => handleDelete(record.id)}
          >
            <DeleteFilled />
          </button>
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);

    if (pagination.pageSize !== tableParams.pagination.pageSize) {
      // setNextTokens([]);
      setHasMore(true);
      setTableParams({
        pagination: {
          ...pagination,
          current: 1,
        },
        filters,
        sortOrder: sorter.order,
        sortField: sorter.field,
      });
    } else {
      setTableParams({
        pagination,
        filters,
        sortOrder: sorter.order,
        sortField: sorter.field,
      });
    }
  };

  if (isContentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <div className="flex flex-col gap-8 mt-8">
        <div className="flex justify-between">
          <div className="text-2xl font-medium">Store Managment</div>

          <Button
            color="default"
            variant="solid"
            size="large"
            onClick={() => showAddNewDrinkModal()}
          >
            Add New Drink
          </Button>
        </div>

        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={drinks}
          pagination={{
            ...tableParams.pagination,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          loading={loading}
          onChange={handleTableChange}
        />

        <AddNewDrinkModal
          isVisible={isAddNewDrinkModalVisible}
          onCancel={handleCancelAddNewDrink}
          initialValues={drinkToAdd}
          onSubmit={handleAddNewDrink}
          isDrinkAddingPending={isDrinkAddingPending}
        />

        <DeleteModal
          isVisible={isModalVisible}
          onCancel={handleCancel}
          onConfirm={handleOk}
        />

        <EditDrinkModal
          isVisible={isEditDrinkModalVisible}
          onCancel={handleCancelEdit}
          initialValues={drinkToEdit}
          onSubmit={handleEditDrink}
        />
      </div>
    </>
  );
};

export default storeManagmentPage;
