<script setup lang="ts">
import { useProductsViewModel } from '../viewmodels/useProductsViewModel'

const { productsQuery, products, activeProducts, inactiveProducts } = useProductsViewModel()

const handleCreate = () => {
  // placeholder for create action
}
</script>

<template>
  <section>
    <header>
      <h1>Produtos</h1>
      <button type="button" @click="handleCreate">Novo Produto</button>
    </header>
    <article>
      <p>Carregando: {{ productsQuery.isLoading }}</p>
      <p>Total de produtos: {{ products.length }}</p>
      <p>Produtos ativos: {{ activeProducts.length }}</p>
      <p>Produtos inativos: {{ inactiveProducts.length }}</p>
    </article>
  </section>
</template>
