/* global NGD:true, $, vis, JSONEditor */
NGD = {
  data: {
    nodes: [],
    links: []
  },
  schemas: {
    node: null,
    link: null
  },
  vis: null, // visualisation object
  editor: null // JSON editor
}

$(function () {
  const data_path = '../data/'

  // Init vis canvas
  var options = {
    edges: {
      smooth: {
        type: 'discrete',
        roundness: 0
      },
      width: 2
    },
    nodes: {
      mass: 5,
      shape: 'dot',
      size: 20
    },
    interaction: {
      zoomView: false
    }
  }
  NGD.vis = new vis.Network(document.getElementById('canvas'), {}, options)

  // Load nodes
  $.ajax({
    url: data_path + 'nodes.json',
    success: function (data) {
      NGD.data.nodes = data
      // Load links
      $.ajax({
        url: data_path + 'links.json',
        success: function (data) {
          NGD.data.links = data
          drawData()
        }
      })
    }
  })

  // Draw data as table
  function drawData () {
    // Draw nodes
    var nodes_dict = {}
    var tbody = $('#data-nodes table tbody')
    tbody.html('')
    for (var i in NGD.data.nodes) {
      var item = NGD.data.nodes[i]
      nodes_dict[item.key] = item.label
      $('<tr>')
        .attr('id', 'node-' + item.key)
        .append($('<td>').text(item.type))
        .append($('<td>').text(item.key))
        .append($('<td>').text(item.label))
        .appendTo(tbody)
    }

    // Draw links
    tbody = $('#data-links table tbody')
    tbody.html('')
    for (i in NGD.data.links) {
      item = NGD.data.links[i]

      var text = {}
      var fields = ['quo', 'rel', 'sic']
      for (var f in fields) {
        var field = fields[f]
        if (!item[field].key) {
          text[field] = '<em>null</em>'
          continue
        }
        text[field] = item[field].key
        if (item[field].parent) text[field] += ' (P)'
        text[field] += ' <small class="text-muted">' + nodes_dict[item[field].key] + '</small>'
      }

      $('<tr>')
        .append($('<td>').html(item.type))
        .append($('<td>').html(text.quo))
        .append($('<td>').html(text.rel))
        .append($('<td>').html(text.sic))
        .append($('<td>').html(item.status))
        .appendTo(tbody)
    }
  }

  require(['Parser'], function (p) {
    $('#btnParse').click(function () {
      var input = $('#inputPhrase').val()
      var parser = new p.Parser(NGD.data)
      $('#output').html('')
      NGD.vis.setData({})
      $('#chart tbody').html('')
      parser.parse(input, function (err, data) {
        if (err) {
          $('#output')
            .append($('<h3>').text('Error'))
            .append($('<pre>').addClass('alert-danger').text(err))
        } else {
          // Dump parser output
          var fields = ['output', 'provisionals', 'log']
          for (var i in fields) {
            var field = fields[i]
            var out = typeof data[field] === 'string' ? data[field] : JSON.stringify(data[field], null, 2)
            $('#output')
              .append($('<h3>').text(field))
              .append($('<pre>').text(out))
          }

          // Visualise network
          var vis_data = data.network.toVisJS()
          console.log(vis_data)
          NGD.vis.setData(vis_data)

          // Fill parse chart
          $('#chart tbody').html('<tr><td colspan="13">TODO...</td></tr>')
        }
      })
      return false
    })
  })

  // Load schemas
  $.ajax({
    url: data_path + 'node.schema.json',
    success: function (data) {
      NGD.schemas.node = data
    }
  })

  $.ajax({
    url: data_path + 'link.schema.json',
    success: function (data) {
      NGD.schemas.link = data
    }
  })

  // Editing functionality
  JSONEditor.defaults.options = {
    theme: 'bootstrap3',
    iconlib: 'bootstrap3',
    disable_collapse: true
  }
  JSONEditor.defaults.options
  $('#btnAddNode').click(function () {
    if (NGD.editor) {
      NGD.editor.destroy()
    }
    NGD.editor = new JSONEditor(document.getElementById('editor'), {
      schema: NGD.schemas.node
    })
    $('#btnSave').off().click(function () {
      NGD.data.nodes.push(NGD.editor.getValue())
      drawData()
      $('#editor-modal').modal('hide')
    })
    $('#editor-modal').modal('show')
    return false
  })
  $('#btnAddLink').click(function () {
    if (NGD.editor) {
      NGD.editor.destroy()
    }
    NGD.editor = new JSONEditor(document.getElementById('editor'), {
      schema: NGD.schemas.link
    })
    $('#btnSave').off().click(function () {
      NGD.data.links.push(NGD.editor.getValue())
      drawData()
      $('#editor-modal').modal('hide')
    })
    $('#editor-modal').modal('show')
    return false
  })
})
