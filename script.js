/* global NGD:true, $ */
NGD = {
  data: {
    nodes: [],
    links: []
  }
}

$(function () {
  // Load nodes
  $.ajax({
    url: 'data/nodes.json',
    success: (data) => {
      NGD.data.nodes = data
      var tbody = $('#data-nodes table tbody')
      for (var i in data) {
        var item = data[i]
        $('<tr>')
          .append($('<td>').text(item.type))
          .append($('<td>').text(item.key))
          .append($('<td>').text(item.label))
          .appendTo(tbody)
      }
    }
  })

  // Load links
  $.ajax({
    url: 'data/links.json',
    success: (data) => {
      NGD.data.links = data
      var tbody = $('#data-links table tbody')
      for (var i in data) {
        var item = data[i]
        $('<tr>')
          .append($('<td>').text(item.type))
          .append($('<td>').text(item.quo.key + (item.quo.parent ? ' (P)' : '')))
          .append($('<td>').text(item.rel.key ? item.rel.key : 'null'))
          .append($('<td>').text(item.sic.key + (item.sic.parent ? ' (P)' : '')))
          .append($('<td>').text(item.status))
          .appendTo(tbody)
      }
    }
  })
})

require(['Parser'], function (p) {
  $('#btnParse').click(() => {
    var input = $('#inputPhrase').val()
    var parser = new p.Parser(NGD.data)
    parser.parse(input, (err, data) => {
      if (err) {
        $('#log').text('')
        $('#out').text(err)
      } else {
        $('#log').text(data.log)
        $('#out').text(data.output)
      }
    })
    return false
  })
})
