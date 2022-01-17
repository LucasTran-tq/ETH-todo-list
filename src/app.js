App = {
  loading: false,
  contracts: {},
  load: async () => {
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  loadAccount: async () => {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    App.account = accounts[0];
    console.log(accounts[0]);
    // console.log(App.account);
  },

  loadContract: async () => {
    const todoList = await $.getJSON("TodoList.json");

    App.contracts.TodoList = TruffleContract(todoList);
    App.contracts.TodoList.setProvider(window.ethereum);

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed();
  },

  render: async () => {
    if (App.loading) {
      return;
    }

    App.setLoading(true);

    $("#account").html(App.account);

    await App.renderTasks();

    App.setLoading(false);
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount();
    const $taskTemplate = $(".taskTemplate");

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      const task = await App.todoList.tasks(i);
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];
      

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find(".content").html(taskContent);
      $newTaskTemplate
        .find("input")
        .prop("name", taskId)
        .prop("checked", taskCompleted);

      if (taskCompleted) {
        $("#completedTaskList").append($newTaskTemplate);
      } else {
        $("#taskList").append($newTaskTemplate);
      }

      // Show the task
      $newTaskTemplate.show();
    }
  },

  setLoading: async (boolean) => {
    App.loading = boolean;

    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
