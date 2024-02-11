import React from 'react';
import ItemCard from './ItemCard';

const ItemContainer = ({ items, itemFunction, DeleteIemFunction = null, filter = false }) => {
  const columns = [];
   //console.log("[CONTAINER ITEMS] : ITEMS ARE\n", items)

  for (let i = 0; i < items.length; i += 3) {
    const columnItems = items.slice(i, i + 3);
    const columnCards = columnItems.map((item, index) => (
      <ItemCard key={item.id} item={item} itemFunction={itemFunction} DeleteIemFunction={DeleteIemFunction} filter={filter} />
    ));

    columns.push(
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '20px',
        }}
        key={i}
      >
        {columnCards}
      </div>
    );
  }

  return <>{columns}</>;
};

export default ItemContainer;